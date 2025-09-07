
# Agri-Trace

# AgroChainTrace

AgroChainTrace is a supply chain management system for agricultural products that leverages blockchain technology to ensure transparency, traceability, and authenticity verification throughout the supply chain.

## Features

- **Product Tracking**: Track agricultural products from farm to consumer
- **Blockchain Verification**: Verify product authenticity and transactions on the Ethereum blockchain
- **Supply Chain Management**: Record and monitor each stage of the supply chain
- **Transaction History**: View and verify the complete history of product transfers
- **User Authentication**: Role-based access control for different supply chain participants

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- Ethers.js for blockchain interaction

### Backend
- Node.js with Express
- SQLite with Drizzle ORM
- TypeScript

### Blockchain
- Ethereum blockchain
- Hardhat development environment
- Solidity smart contracts
- OpenZeppelin contract libraries

## Blockchain Integration

AgroChainTrace integrates with the Ethereum blockchain to provide immutable records of product information, transactions, and verifications. This ensures that all participants in the supply chain can trust the data and verify the authenticity of products.

### Smart Contracts

The core of our blockchain integration is the `AgroChainProduct` smart contract, which provides the following functionality:

- **Product Management**: Create and retrieve product information
- **Transaction Recording**: Record product transfers between supply chain participants
- **Supply Chain Stage Tracking**: Record and track different stages of the supply chain
- **Verification Management**: Record and verify product authenticity certificates

### Blockchain Services

The application includes several services that interact with the blockchain:

- **BlockchainService**: Handles connection to the Ethereum network
- **ProductService**: Manages product-related operations on the blockchain
- **TransactionService**: Records and retrieves product transfers
- **VerificationService**: Validates product authenticity

### Frontend Integration

The frontend integrates with blockchain services through:

- **BlockchainContext**: React context provider for blockchain functionality
- **useBlockchain Hook**: Custom hook for interacting with blockchain services

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Ethereum wallet (for blockchain interaction)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/AgroChainTrace.git
   cd AgroChainTrace
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration

4. Compile and deploy smart contracts
   ```
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. Start the development server
   ```
   npm run dev
   ```

### Running Tests

```
# Run all tests
npm test

# Run blockchain smart contract tests
npm run test:blockchain

# Run blockchain service tests
npm run test:services

# Run frontend tests
npm run test:frontend
```

## Blockchain Wallet Integration

To interact with the blockchain features:

1. Install MetaMask or another Ethereum wallet browser extension
2. Connect your wallet to the application using the "Connect Wallet" button
3. Ensure you have some ETH for gas fees (use a testnet faucet for development)

## Deployment

### Smart Contract Deployment

The smart contracts can be deployed to various networks:

```
# Deploy to local Hardhat network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

After deployment, update the contract address in your `.env` file.

### Application Deployment

1. Build the application
   ```
   npm run build
   ```

2. Deploy the built application to your hosting provider

## License

This project is licensed under the MIT License - see the LICENSE file for details.

