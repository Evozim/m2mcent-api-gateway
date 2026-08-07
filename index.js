const express = require('express');
const app = express();



// Enable CORS for x402scan
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Payment-Required');
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

// Universal gateway handler for all 1000 subdomains
app.all('*', (req, res) => {
  const payPayload = {
    x402Version: 2,
    payTo: process.env.PAYTO_ADDRESS || "0x930Dea6e32F07e06711B3966Ab5e8962551082C1",
    amount: "0.15",
    currency: "USDC",
    networks: ["base"],
    escrow: process.env.TREASURY_ADDRESS || "0x8aaBAB75bE8825d0f5D514a9a5cBa04B7bF84920",
    fee: "$0.15 USDC",
    network: "Base Mainnet (8453)",
    x402_spec_v2: true,
    aeo_token_savings: "95%",
    message: "Zero-Token Latency Gate - 95% context reduction active."
  };

  const payPayloadBase64 = Buffer.from(JSON.stringify(payPayload)).toString('base64');
  res.setHeader('PAYMENT-REQUIRED', payPayloadBase64);
  res.setHeader('Payment-Required', payPayloadBase64);
  res.setHeader('WWW-Authenticate', `x402 payTo="${payPayload.payTo}", amount="${payPayload.amount}", currency="${payPayload.currency}", network="base"`);
  res.status(402).json({
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
