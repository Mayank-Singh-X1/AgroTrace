# AgroChainTrace Blockchain Integration

This directory contains the blockchain integration for the AgroChainTrace application, which enables transparent and immutable tracking of agricultural products throughout the supply chain.

## Overview

The blockchain integration consists of:

1. **Smart Contracts**: Solidity contracts for tracking products, transactions, supply chain stages, and verifications
2. **Blockchain Services**: TypeScript services for interacting with the Ethereum blockchain
3. **Frontend Integration**: React hooks and components for blockchain interaction

## Directory Structure

```
blockchain/
├── contracts/           # Solidity smart contracts
│   └── AgroChainProduct.sol  # Main product tracking contract
├── services/            # Blockchain interaction services
│   ├── BlockchainService.ts  # Core blockchain connection service
│   ├── ProductService.ts     # Product management service
│   ├── TransactionService.ts # Transaction recording service
│   ├── VerificationService.ts # Verification service
│   └── index.ts              # Service exports
├── test/                # Contract test files
│   └── AgroChainProduct.test.js # Tests for the main contract
└── README.md            # This documentation file
```

## Smart Contracts

### AgroChainProduct.sol

The main smart contract for tracking agricultural products through the supply chain. It includes:

- **Product Management**: Create and retrieve product information
- **Transaction Tracking**: Record product transfers between supply chain actors
- **Supply Chain Stages**: Track different stages of the product lifecycle
- **Verification Records**: Store quality and authenticity verifications

## Blockchain Services

### BlockchainService

Handles the connection to the Ethereum blockchain, including:

- Provider initialization based on environment
- Contract instance creation
- Wallet setup for transaction signing

### ProductService

Manages product-related operations on the blockchain:

- Creating new products
- Retrieving product details
- Recording supply chain stages
- Retrieving product stages

### TransactionService

Handles product transfer transactions:

- Recording transactions on the blockchain
- Retrieving product transaction history
- Verifying transaction authenticity

### VerificationService

Manages product verification records:

- Recording verification results
- Retrieving verification history
- Checking product verification status

## Frontend Integration

The frontend integration includes:

- **useBlockchain Hook**: React hook for blockchain interaction
- **BlockchainContext**: Context provider for blockchain functionality
- **Transaction History Component**: Displays blockchain-verified transactions
- **Verification Component**: Allows recording verifications on the blockchain

## Setup and Deployment

### Prerequisites

- Node.js and npm
- MetaMask or another Ethereum wallet

### Configuration

1. Create a `.env` file with the following variables:

```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
CONTRACT_ADDRESS=deployed_contract_address
```

### Deployment

1. Compile the contracts:

```bash
npx hardhat compile
```

2. Deploy to a network:

```bash
npx hardhat run server/blockchain/deploy.ts --network sepolia
```

3. Update the contract address in your environment variables

## Testing

Run the test suite with:

```bash
npx hardhat test
```

## Usage

### Backend

Import the blockchain services in your server code:

```typescript
import { blockchainService, productService, transactionService, verificationService } from './blockchain/services';

// Example: Record a transaction
async function recordProductTransfer(productId, toAddress) {
  const txHash = await transactionService.recordTransaction(
    'tx-' + Date.now(),
    productId,
    toAddress,
    'transfer',
    100,
    50
  );
  return txHash;
}
```

### Frontend

Use the blockchain context in your components:

```tsx
import { useBlockchainContext } from '@/context/BlockchainContext';

function MyComponent() {
  const { connected, connect, recordTransaction } = useBlockchainContext();
  
  const handleTransfer = async () => {
    if (!connected) {
      await connect();
    }
    
    const txHash = await recordTransaction(
      'tx-' + Date.now(),
      'product-123',
      '0x123...',
      'transfer',
      100,
      50
    );
    
    console.log('Transaction recorded:', txHash);
  };
  
  return (
    <button onClick={handleTransfer}>Transfer Product</button>
  );
}
```

## Security Considerations

- Never store private keys in client-side code
- Use environment variables for sensitive information
- Implement proper access control in smart contracts
- Validate all inputs before sending transactions
- Consider using multisig wallets for critical operations