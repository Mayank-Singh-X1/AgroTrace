# Blockchain Features User Guide

## Introduction

AgroChainTrace incorporates blockchain technology to provide transparent, immutable records of agricultural products throughout the supply chain. This guide explains how to use the blockchain features in the application.

## Connecting Your Wallet

1. **Install MetaMask**: If you haven't already, install the [MetaMask](https://metamask.io/) browser extension.

2. **Create or Import a Wallet**: Set up your Ethereum wallet in MetaMask.

3. **Connect to the Application**:
   - Click the "Connect Wallet" button in the application header
   - Approve the connection request in MetaMask
   - Your wallet address will appear in the header when connected

4. **Switch Networks**: Ensure you're connected to the correct network:
   - For production: Ethereum Mainnet
   - For testing: Sepolia Testnet
   - For local development: Localhost 8545

## Blockchain Features by Role

### Producers

1. **Creating Products on the Blockchain**:
   - Navigate to the Products page
   - Click "Add New Product"
   - Fill in the product details
   - Check "Record on Blockchain" to store the product information on the blockchain
   - Submit the form and approve the transaction in MetaMask

2. **Recording Supply Chain Stages**:
   - Navigate to the Supply Chain page
   - Select a product
   - Click "Add Stage"
   - Fill in the stage details (harvesting, processing, packaging, etc.)
   - Check "Record on Blockchain" to store the stage information on the blockchain
   - Submit the form and approve the transaction in MetaMask

### Distributors

1. **Recording Product Transfers**:
   - Navigate to the Transactions page
   - Click "New Transaction"
   - Select the product and recipient
   - Enter quantity and price
   - Check "Record on Blockchain" to store the transaction on the blockchain
   - Submit the form and approve the transaction in MetaMask

2. **Verifying Received Products**:
   - Navigate to the Transactions page
   - Find the incoming transaction
   - Click "Verify on Blockchain"
   - The application will check the blockchain for the transaction record
   - A green checkmark will appear if the transaction is verified

### Certifiers

1. **Recording Product Verifications**:
   - Navigate to the Verification page
   - Select a product
   - Click "New Verification"
   - Fill in the verification details (type, result, validity period)
   - Check "Record on Blockchain" to store the verification on the blockchain
   - Submit the form and approve the transaction in MetaMask

2. **Viewing Verification History**:
   - Navigate to the Verification page
   - Select a product
   - View the list of verifications
   - Blockchain-verified records will display a "Blockchain Verified" badge

### Consumers

1. **Verifying Product Authenticity**:
   - Navigate to the Consumer Lookup page
   - Enter the product ID or scan the QR code
   - View the product details and verification status
   - Click "Verify on Blockchain" to check the product's blockchain record
   - The verification result will show whether the product is authentic

## Understanding Blockchain Verification

### Verification Badges

- **Blockchain Verified** (Green): The record exists on the blockchain and is verified
- **Not Verified** (Yellow): The record exists in the database but not on the blockchain
- **Verification Failed** (Red): The blockchain record doesn't match the database record

### Transaction Status

- **Pending**: The transaction has been submitted to the blockchain but not yet confirmed
- **Confirmed**: The transaction has been confirmed on the blockchain
- **Failed**: The transaction failed to be processed on the blockchain

## Gas Fees

When recording information on the blockchain, you'll need to pay gas fees in ETH:

1. **Gas Cost Estimation**: Before submitting a transaction, the application will estimate the gas cost

2. **Transaction Approval**: MetaMask will display the estimated gas fee for your approval

3. **Gas Price Settings**: You can adjust the gas price in MetaMask to prioritize your transaction

## Troubleshooting

### Common Issues

1. **Transaction Pending for a Long Time**:
   - The gas price might be too low
   - Increase the gas price in MetaMask or submit a new transaction

2. **Transaction Failed**:
   - Check if you have enough ETH for gas fees
   - Verify you're connected to the correct network
   - Try again with a higher gas limit

3. **Wallet Not Connecting**:
   - Ensure MetaMask is unlocked
   - Refresh the page and try again
   - Check if you're using a supported browser

4. **Verification Failed**:
   - The product might not be recorded on the blockchain
   - The product ID might be incorrect
   - The blockchain record might be on a different network

## Best Practices

1. **Keep Your Private Keys Secure**: Never share your private keys or seed phrase

2. **Verify Important Transactions**: Always check transaction details before approving

3. **Record Critical Information**: Prioritize recording important product information on the blockchain

4. **Regular Verification**: Periodically verify your products on the blockchain

5. **Network Selection**: Ensure you're on the correct network before performing transactions

## Support

If you encounter issues with the blockchain features, please contact support at support@agrochaintrace.com with the following information:

- Your wallet address
- Transaction hash (if applicable)
- Description of the issue
- Screenshots of any error messages