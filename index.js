const express = require('express');
const app = express();

// Enable CORS for x402scan and AgentCash
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Payment-Required, WWW-Authenticate');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const path = require('path');
app.get('/openapi.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.json'));
});
app.get('/.well-known/openapi.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.json'));
});

// Universal gateway handler for all endpoints
app.all('*', (req, res) => {
  const payTo = process.env.PAYTO_ADDRESS || "0x930Dea6e32F07e06711B3966Ab5e8962551082C1";

  // Full x402 v2 protocol payload according to Coinbase / Merit Systems specification
  const payPayload = {
    x402Version: 2,
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453", // CAIP-2 format for Base Mainnet
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base Mainnet
        amount: "150000", // 0.15 USDC in 6-decimal atomic units
        payTo: payTo,
        maxTimeoutSeconds: 300
      }
    ],
    resource: {
      url: "https://api.m2mcent.com" + req.path,
      description: "Agentic Payroll Processing Service",
      mimeType: "application/json"
    },
    payTo: payTo,
    amount: "0.15",
    currency: "USDC",
    networks: ["base", "eip155:8453"],
    escrow: payTo,
    fee: "$0.15 USDC",
    network: "eip155:8453",
    x402_spec_v2: true,
    aeo_token_savings: "95%",
    message: "Zero-Token Latency Gate - 95% context reduction active."
  };

  const payPayloadBase64 = Buffer.from(JSON.stringify(payPayload)).toString('base64');
  res.setHeader('PAYMENT-REQUIRED', payPayloadBase64);
  res.setHeader('Payment-Required', payPayloadBase64);
  // MPP/x402 WWW-Authenticate header spec: Payment realm with location/token parameters
  res.setHeader('WWW-Authenticate', `Payment realm="api.m2mcent.com", token="x402"`);
  
  res.status(402).json({
    x402Version: 2,
    accepts: payPayload.accepts,
    resource: payPayload.resource,
    error: "Payment Required",
    code: "x402_auth_missing",
    token_savings: "95% context reduction",
    details: "This endpoint requires an x402 machine-to-machine payment via Base Mainnet."
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`x402 Universal Gateway running locally on port ${PORT}`));
}
