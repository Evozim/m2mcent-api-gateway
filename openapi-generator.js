const fs = require('fs');
const path = require('path');

function generateOpenApi(services, baseUrl = "https://api.m2mcent.com") {
  const baseSpec = {
    "openapi": "3.1.0",
    "info": {
      "title": "M2MCent Ecosystem 1000 Agentic Services",
      "description": "The largest decentralized Machine-to-Machine API ecosystem powered by the x402 standard.",
      "version": "1.0.0",
      "x-guidance": "Use POST /agentic-payroll-processor-mcp/api/process to process automated agentic payrolls on Base Mainnet.",
      "contact": {
        "email": "contact@m2mcent.com"
      }
    },
    "servers": [
      {
        "url": baseUrl,
        "description": "M2MCent API Gateway"
      }
    ],
    "x-discovery": {
      "ownershipProofs": [
        "0x45d796e1b593d5105df62acc7df716a7e4b0ed7a7fc64402124795fffaafd0085e8583f77378c94cdd3528544fa617cd62e54add9e9ab7896d595bca0d5476501c",
        "0xb34dcd3a71d26b992eb8875abe6ecd20886282afc79c137e57d6895e0d5dcaea0b440aa41b7a496365c20d2e8c98c1c4fa4a6a1290f51a3f135fb0073ce89fa11c"
      ]
    },
    "ownershipProofs": [
      {
        "address": "0x930Dea6e32F07e06711B3966Ab5e8962551082C1",
        "signature": "0x45d796e1b593d5105df62acc7df716a7e4b0ed7a7fc64402124795fffaafd0085e8583f77378c94cdd3528544fa617cd62e54add9e9ab7896d595bca0d5476501c"
      },
      {
        "address": "0x930Dea6e32F07e06711B3966Ab5e8962551082C1",
        "signature": "0xb34dcd3a71d26b992eb8875abe6ecd20886282afc79c137e57d6895e0d5dcaea0b440aa41b7a496365c20d2e8c98c1c4fa4a6a1290f51a3f135fb0073ce89fa11c"
      }
    ],
    "paths": {}
  };

  services.forEach(service => {
    baseSpec.paths[service.path] = {
      "post": {
        "operationId": `execute_${service.id.replace(/-/g, '_')}`,
        "summary": service.title,
        "description": service.description,
        "x-payment-info": {
          "price": {
            "mode": "fixed",
            "currency": "USD",
            "amount": service.price
          },
          "protocols": [
            {
              "x402": {
                "payTo": "0x930Dea6e32F07e06711B3966Ab5e8962551082C1",
                "network": "eip155:8453",
                "currency": "USDC"
              }
            }
          ]
        },
        "extensions": {
          "bazaar": {
            "info": {
              "name": service.title,
              "description": service.description,
              "input": {
                "type": "application/json",
                "method": "POST",
                "params": [service.inputProperty]
              },
              "output": {
                "type": "application/json",
                "returns": [service.outputProperty]
              }
            },
            "schema": {
              "properties": {
                "input": {
                  "type": "object",
                  "properties": {
                    "body": {
                      "type": "object",
                      "properties": {
                        [service.inputProperty]: { "type": "string" }
                      },
                      "required": [service.inputProperty]
                    }
                  },
                  "required": ["body"]
                },
                "output": {
                  "type": "object",
                  "properties": {
                    "example": {
                      "type": "object",
                      "properties": {
                        [service.outputProperty]: { "type": "boolean" },
                        "txHash": { "type": "string" }
                      },
                      "required": [service.outputProperty]
                    }
                  },
                  "required": ["example"]
                }
              }
            }
          }
        },
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  [service.inputProperty]: {
                    "type": "string",
                    "description": `Input data for ${service.id}`
                  }
                },
                "required": [service.inputProperty]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful execution",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    [service.outputProperty]: { "type": "boolean" },
                    "txHash": { "type": "string" }
                  },
                  "required": [service.outputProperty]
                }
              }
            }
          },
          "402": {
            "description": "Payment Required"
          }
        }
      }
    };
  });

  return baseSpec;
}

module.exports = { generateOpenApi };
