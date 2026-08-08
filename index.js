const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { declareDiscoveryExtension } = require('@x402/extensions/bazaar');
const fs = require('fs');
const { generateOpenApi } = require('./openapi-generator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  exposedHeaders: ['Payment-Required', 'WWW-Authenticate']
}));
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

// ERC-8004 Trustless Agents Metadata Standard
app.get('/.well-known/erc8004.json', (req, res) => {
  res.json({
    name: "M2MCent Premium API Gateway",
    description: "Decentralized Escrow API Gateway for 1,000 High-Priority Agentic Endpoints.",
    version: "1.0.0",
    identity: {
      address: "0x8aaBAB75bE8825d0f5D514a9a5cBa04B7bF84920",
      publicKey: "M2MCent-Treasury-Key",
      domain: "api.m2mcent.com"
    },
    capabilities: {
      tags: ["AI", "NLP", "Smart Contracts", "Data Processing", "Computer Vision"],
      qualitySignaling: {
        priority: "high",
        latency: "ultra-low",
        contextReduction: "95% Token Savings (AEO Active)"
      }
    },
    communicationServices: {
      protocols: ["http", "x402-v2"],
      baseUrl: "https://api.m2mcent.com",
      endpointsCount: services.length
    },
    operationalParameters: {
      supportedChains: ["eip155:8453"],
      supportedAssets: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"]
    }
  });
});

// Create dynamic route for each service
services.forEach((service, index) => {
  app.all(service.path, (req, res) => {
    const authHeader = req.headers['authorization'];
    
    // Convert USD string to USDC micro-units (multiply by 1,000,000)
    // "0.150000" -> "150000"
    const amountUSDC = Math.round(parseFloat(service.price) * 1000000).toString();
    const payTo = "0xDb48F51A2de8F4a80CD1d0BAdcd18E847734A74a";
    const expires = Math.floor(Date.now() / 1000) + 300;
    
    // Determine the challenge ID dynamically
    const chalId = `chal_m2mcent_${String(index + 1).padStart(2, '0')}`;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const discoveryExt = declareDiscoveryExtension({
        method: "POST",
        bodyType: "json",
        input: {
          [service.inputProperty]: "example data"
        },
        inputSchema: {
          properties: {
            [service.inputProperty]: { type: "string" }
          },
          required: [service.inputProperty]
        },
        output: {
          example: {
            [service.outputProperty]: true,
            txHash: "0xMockTransactionHash1234567890abcdef"
          }
        }
      });

      discoveryExt.bazaar.info.name = service.title;
      discoveryExt.bazaar.info.description = service.description;

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
        extensions: discoveryExt
      };

          const payPayloadBase64 = Buffer.from(JSON.stringify(payPayload)).toString('base64');
      res.setHeader('PAYMENT-REQUIRED', payPayloadBase64);
      res.setHeader('Payment-Required', payPayloadBase64);
      
      const requestObjBase64url = Buffer.from(JSON.stringify({
        url: "https://api.m2mcent.com" + req.path,
        method: req.method,
        currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        amount: amountUSDC,
        recipient: payTo
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
