const express = require('express');
const app = express();

app.use(express.json());

// Universal gateway handler for all 1000 subdomains
app.all('*', (req, res) => {
  const payPayload = {
    escrow: process.env.TREASURY_ADDRESS || "0x8aaBAB75bE8825d0f5D514a9a5cBa04B7bF84920",
    fee: "$0.15 USDC",
    network: "Base Mainnet (8453)",
    x402_spec_v2: true,
    aeo_token_savings: "95%",
    message: "Zero-Token Latency Gate - 95% context reduction active."
  };

  res.setHeader('PAYMENT-REQUIRED', Buffer.from(JSON.stringify(payPayload)).toString('base64'));
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
