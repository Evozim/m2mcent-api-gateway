const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { generateOpenApi } = require('./openapi-generator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load services
const servicesPath = path.join(__dirname, 'services.json');
let services = [];
if (fs.existsSync(servicesPath)) {
  services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
} else {
  console.log("No services.json found, running empty.");
}

// Generate OpenAPI spec dynamically
const openApiSpec = generateOpenApi(services, "https://api.m2mcent.com");

app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get('/.well-known/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Create dynamic route for each service
services.forEach((service, index) => {
  app.post(service.path, (req, res) => {
    const authHeader = req.headers['authorization'];
    
    // Convert USD string to USDC micro-units (multiply by 1,000,000)
    // "0.150000" -> "150000"
    const amountUSDC = (parseFloat(service.price) * 1000000).toString();
    const payTo = "0x930Dea6e32F07e06711B3966Ab5e8962551082C1";
    const expires = Math.floor(Date.now() / 1000) + 300;
    
    // Determine the challenge ID dynamically
    const chalId = `chal_m2mcent_${String(index + 1).padStart(2, '0')}`;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const payPayload = {
        x402Version: 2,
        accepts: [
          {
            id: chalId,
            method: "x402",
            intent: "payment",
            scheme: "exact",
            network: "eip155:8453", // CAIP-2 format for Base Mainnet
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base Mainnet
            amount: amountUSDC,
            payTo: payTo,
            expires: expires,
            request: {
              url: "https://api.m2mcent.com" + req.path,
              method: req.method
            },
            maxTimeoutSeconds: 300
          }
        ],
        resource: {
          url: "https://api.m2mcent.com" + req.path,
          description: service.description,
          mimeType: "application/json"
        },
        payTo: payTo,
        amount: service.price,
        currency: "USDC",
        networks: ["base", "eip155:8453"],
        escrow: payTo,
        fee: `$${service.price} USDC`,
        network: "eip155:8453",
        x402_spec_v2: true,
        aeo_token_savings: "95%",
        message: "Zero-Token Latency Gate - 95% context reduction active.",
        extensions: {
          bazaar: {
            schema: {
              properties: {
                input: {
                  type: "object",
                  properties: {
                    body: {
                      type: "object",
                      properties: {
                        [service.inputProperty]: { type: "string" }
                      },
                      required: [service.inputProperty]
                    }
                  },
                  required: ["body"]
                },
                output: {
                  type: "object",
                  properties: {
                    example: {
                      type: "object",
                      properties: {
                        [service.outputProperty]: { type: "boolean" }
                      },
                      required: [service.outputProperty]
                    }
                  },
                  required: ["example"]
                }
              }
            }
          }
        }
      };

      const payPayloadBase64 = Buffer.from(JSON.stringify(payPayload)).toString('base64');
      res.setHeader('PAYMENT-REQUIRED', payPayloadBase64);
      res.setHeader('Payment-Required', payPayloadBase64);
      
      const requestObjBase64url = Buffer.from(JSON.stringify({
        url: "https://api.m2mcent.com" + req.path,
        method: req.method
      })).toString('base64url');
      
      res.setHeader('WWW-Authenticate', `Payment realm="api.m2mcent.com", id="${chalId}", method="x402", intent="payment", expires="${expires}", request="${requestObjBase64url}"`);  
      
      return res.status(402).json({
        x402Version: 2,
        accepts: payPayload.accepts,
        resource: payPayload.resource,
        error: "Payment Required",
        code: "x402_auth_missing",
        token_savings: "95% context reduction",
        details: "This endpoint requires an x402 machine-to-machine payment via Base Mainnet.",
        extensions: payPayload.extensions
      });
    }

    // Mock processing for when payment is validated (in a real app, verify the token via Escrow SC)
    console.log(`Processing ${service.id} request...`);
    return res.status(200).json({
      [service.outputProperty]: true,
      txHash: "0xMockTransactionHash1234567890abcdef"
    });
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`x402 Universal Gateway running locally on port ${PORT}`);
    console.log(`Mounted ${services.length} x402 payment-gated agentic services.`);
  });
}

module.exports = app;
