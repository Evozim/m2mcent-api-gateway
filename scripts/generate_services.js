const fs = require('fs');

const services = [
  {
    id: "agentic-payroll-processor-mcp",
    title: "Execute agentic-payroll-processor-mcp",
    description: "Premium agentic endpoint for agentic-payroll-processor-mcp.",
    path: "/agentic-payroll-processor-mcp/api/process",
    price: "0.150000",
    inputProperty: "payrollData",
    outputProperty: "success"
  },
  {
    id: "smart-contract-auditor-mcp",
    title: "Execute smart-contract-auditor-mcp",
    description: "Automated vulnerability scanner for Solidity smart contracts.",
    path: "/smart-contract-auditor-mcp/api/scan",
    price: "0.250000",
    inputProperty: "contractCode",
    outputProperty: "reportUrl"
  },
  {
    id: "defi-yield-optimizer-mcp",
    title: "Execute defi-yield-optimizer-mcp",
    description: "Finds the best APY across decentralized finance protocols.",
    path: "/defi-yield-optimizer-mcp/api/optimize",
    price: "0.100000",
    inputProperty: "portfolio",
    outputProperty: "recommendations"
  },
  {
    id: "autonomous-trading-bot-mcp",
    title: "Execute autonomous-trading-bot-mcp",
    description: "Executes trading strategies based on real-time market data.",
    path: "/autonomous-trading-bot-mcp/api/trade",
    price: "0.500000",
    inputProperty: "strategy",
    outputProperty: "tradeId"
  },
  {
    id: "zk-proof-generator-mcp",
    title: "Execute zk-proof-generator-mcp",
    description: "Generates zero-knowledge proofs for off-chain computation.",
    path: "/zk-proof-generator-mcp/api/prove",
    price: "0.750000",
    inputProperty: "computation",
    outputProperty: "proof"
  },
  {
    id: "decentralized-storage-indexer-mcp",
    title: "Execute decentralized-storage-indexer-mcp",
    description: "Indexes IPFS and Arweave content for fast retrieval.",
    path: "/decentralized-storage-indexer-mcp/api/index",
    price: "0.050000",
    inputProperty: "cid",
    outputProperty: "indexStatus"
  },
  {
    id: "cross-chain-bridge-mcp",
    title: "Execute cross-chain-bridge-mcp",
    description: "Facilitates seamless asset transfers between blockchains.",
    path: "/cross-chain-bridge-mcp/api/bridge",
    price: "0.300000",
    inputProperty: "transferDetails",
    outputProperty: "txHash"
  },
  {
    id: "nft-metadata-generator-mcp",
    title: "Execute nft-metadata-generator-mcp",
    description: "Generates AI-driven metadata and artwork for NFTs.",
    path: "/nft-metadata-generator-mcp/api/generate",
    price: "0.200000",
    inputProperty: "prompt",
    outputProperty: "metadataUrl"
  },
  {
    id: "dao-governance-analyzer-mcp",
    title: "Execute dao-governance-analyzer-mcp",
    description: "Analyzes DAO proposals and voting trends.",
    path: "/dao-governance-analyzer-mcp/api/analyze",
    price: "0.150000",
    inputProperty: "proposalId",
    outputProperty: "analysis"
  },
  {
    id: "crypto-tax-calculator-mcp",
    title: "Execute crypto-tax-calculator-mcp",
    description: "Calculates tax liabilities across multiple wallets.",
    path: "/crypto-tax-calculator-mcp/api/calculate",
    price: "0.400000",
    inputProperty: "walletAddresses",
    outputProperty: "taxReport"
  }
];

fs.writeFileSync('services.json', JSON.stringify(services, null, 2));
console.log(`Generated services.json with ${services.length} nodes.`);
