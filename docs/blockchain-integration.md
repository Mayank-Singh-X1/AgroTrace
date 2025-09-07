# Blockchain Integration Documentation

## Overview

AgroChainTrace integrates with the Ethereum blockchain to provide immutable, transparent, and verifiable records of agricultural products throughout the supply chain. This document provides detailed information about the blockchain integration, including smart contracts, services, and frontend components.

## Smart Contracts

### AgroChainProduct.sol

The main smart contract that handles product tracking, transactions, supply chain stages, and verifications.

#### Key Structures

- **Product**: Stores product information including ID, batch number, name, category, producer address, and verification status
- **Transaction**: Records product transfers between addresses with details like quantity and price
- **SupplyChainStage**: Tracks different stages of the supply chain with location and status information
- **Verification**: Stores product verification records with type, result, and validity period

#### Main Functions

- `createProduct(string id, string batchNumber, string name, string category)`: Creates a new product
- `getProduct(string id)`: Retrieves product information
- `recordTransaction(string id, string productId, address to, string txType, uint256 quantity, uint256 price)`: Records a product transfer
- `getProductTransactions(string productId)`: Gets all transactions for a product
- `recordSupplyChainStage(string id, string productId, string stageType, string location, string notes, string status)`: Records a supply chain stage
- `getProductStages(string productId)`: Gets all supply chain stages for a product
- `recordVerification(string id, string productId, string verificationType, string result, uint256 validUntil)`: Records a product verification
- `getProductVerifications(string productId)`: Gets all verifications for a product
- `isVerified(string productId)`: Checks if a product is verified

## Blockchain Services

### BlockchainService

Handles the connection to the Ethereum network and provides the contract instance.

```typescript
class BlockchainService {
  constructor(providerUrl?: string, privateKey?: string, contractAddress?: string);
  isConnected(): boolean;
  getContract(): ethers.Contract;
  canWrite(): boolean;
  getAccount(): string;
}
```

### ProductService

Manages product-related operations on the blockchain.

```typescript
class ProductService {
  constructor(blockchainService: BlockchainService);
  createProduct(id: string, batchNumber: string, name: string, category: string): Promise<boolean>;
  getProduct(id: string): Promise<any>;
  recordSupplyChainStage(id: string, productId: string, stageType: string, location: string, notes: string, status: string): Promise<boolean>;
  getProductStages(productId: string): Promise<any[]>;
}
```

### TransactionService

Handles recording and retrieving product transfers on the blockchain.

```typescript
class TransactionService {
  constructor(blockchainService: BlockchainService);
  recordTransaction(id: string, productId: string, to: string, txType: string, quantity: number, price: number): Promise<boolean>;
  getProductTransactions(productId: string): Promise<any[]>;
  verifyTransaction(transactionId: string): Promise<boolean>;
}
```

### VerificationService

Manages product authenticity verification on the blockchain.

```typescript
class VerificationService {
  constructor(blockchainService: BlockchainService);
  recordVerification(id: string, productId: string, verificationType: string, result: string, validUntil: number): Promise<boolean>;
  getProductVerifications(productId: string): Promise<any[]>;
  isProductVerified(productId: string): Promise<boolean>;
  verifyVerification(verificationId: string): Promise<boolean>;
}
```

## Frontend Integration

### useBlockchain Hook

A custom React hook that provides blockchain functionality to components.

```typescript
function useBlockchain() {
  // State and methods
  const connect = async (): Promise<boolean>;
  const disconnect = (): void;
  
  // Product operations
  const createProduct = async (id: string, batchNumber: string, name: string, category: string): Promise<boolean>;
  const getProduct = async (id: string): Promise<any>;
  
  // Transaction operations
  const recordTransaction = async (id: string, productId: string, to: string, txType: string, quantity: number, price: number): Promise<boolean>;
  const getProductTransactions = async (productId: string): Promise<any[]>;
  
  // Verification operations
  const recordVerification = async (id: string, productId: string, verificationType: string, result: string, validUntil: number): Promise<boolean>;
  const getProductVerifications = async (productId: string): Promise<any[]>;
  const isProductVerified = async (productId: string): Promise<boolean>;
  
  return { connected, account, contract, connect, disconnect, ... };
}
```

### BlockchainContext

A React context provider that makes blockchain functionality available throughout the application.

```typescript
const BlockchainContext = createContext<ReturnType<typeof useBlockchain> | undefined>(undefined);

function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const blockchain = useBlockchain();
  return <BlockchainContext.Provider value={blockchain}>{children}</BlockchainContext.Provider>;
}

function useBlockchainContext() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchainContext must be used within a BlockchainProvider');
  }
  return context;
}
```

## Integration Examples

### Recording a Product on the Blockchain

```typescript
// Backend
const blockchainService = new BlockchainService(process.env.PROVIDER_URL, process.env.PRIVATE_KEY, process.env.CONTRACT_ADDRESS);
const productService = new ProductService(blockchainService);

async function createProductWithBlockchain(productData) {
  // Save to database
  const product = await db.insert(products).values(productData).returning();
  
  // Record on blockchain
  const recorded = await productService.createProduct(
    product.id,
    product.batchNumber,
    product.name,
    product.category
  );
  
  // Update database with blockchain status
  if (recorded) {
    await db.update(products).set({ blockchainVerified: true }).where(eq(products.id, product.id));
  }
  
  return product;
}
```

### Verifying a Product in the Frontend

```tsx
import { useBlockchainContext } from '../context/BlockchainContext';

function ProductVerification({ productId }) {
  const { connected, isProductVerified } = useBlockchainContext();
  const [verified, setVerified] = useState(false);
  
  useEffect(() => {
    async function checkVerification() {
      if (connected && productId) {
        const isVerified = await isProductVerified(productId);
        setVerified(isVerified);
      }
    }
    
    checkVerification();
  }, [connected, productId]);
  
  return (
    <div>
      {verified ? (
        <Badge variant="success">Blockchain Verified</Badge>
      ) : (
        <Badge variant="warning">Not Verified</Badge>
      )}
    </div>
  );
}
```

## Testing

### Smart Contract Tests

Tests for the AgroChainProduct smart contract are located in `server/blockchain/test/AgroChainProduct.test.js` and can be run with:

```
npm run test:blockchain
```

### Service Tests

Tests for blockchain services are located in `server/blockchain/test/` and can be run with:

```
npm run test:services
```

### Frontend Tests

Tests for frontend blockchain integration are located in `client/src/hooks/useBlockchain.test.tsx` and `client/src/context/BlockchainContext.test.tsx` and can be run with:

```
npm run test:frontend
```

## Configuration

### Environment Variables

```
# Blockchain Configuration
PROVIDER_URL=https://sepolia.infura.io/v3/your-infura-key
PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## Troubleshooting

### Common Issues

1. **MetaMask not detected**: Ensure MetaMask is installed and unlocked
2. **Transaction failures**: Check that you have enough ETH for gas fees
3. **Contract not found**: Verify the contract address in your environment variables
4. **Network mismatch**: Ensure you're connected to the correct network in MetaMask

### Debugging

To debug blockchain interactions:

1. Check browser console for errors
2. Verify transaction hashes on Etherscan
3. Use Hardhat's console.log for smart contract debugging
4. Monitor events emitted by the smart contract