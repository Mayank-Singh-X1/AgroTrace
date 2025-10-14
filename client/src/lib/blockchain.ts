// Browser-compatible crypto functions
const createSHA256Hash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Synchronous hash function for compatibility
const createHash = (data: string): string => {
  // Simple hash function for development (not cryptographically secure)
  let hash = 0;
  if (data.length === 0) return hash.toString();
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

// Transaction interface
export interface Transaction {
  id: string;
  productId: string;
  from: string;
  to: string;
  action: 'create' | 'transfer' | 'verify' | 'update';
  data: any;
  timestamp: number;
  signature?: string;
}

// Block interface
export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
}

// Product interface for the blockchain
export interface Product {
  id: string;
  name: string;
  origin: string;
  farmer: string;
  batchNumber: string;
  harvestDate: string;
  currentOwner: string;
  status: 'harvested' | 'processed' | 'shipped' | 'delivered' | 'sold';
  certifications: string[];
  metadata: Record<string, any>;
}

class JSBlockchain {
  private chain: Block[];
  private difficulty: number;
  private products: Map<string, Product>;
  private pendingTransactions: Transaction[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Difficulty for proof-of-work (lower for development)
    this.products = new Map();
    this.pendingTransactions = [];
  }

  // Create the genesis block
  private createGenesisBlock(): Block {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '',
      nonce: 0,
      merkleRoot: this.calculateMerkleRoot([])
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  // Calculate hash for a block
  private calculateHash(block: Block): string {
    const data = block.index + 
                 block.timestamp + 
                 JSON.stringify(block.transactions) + 
                 block.previousHash + 
                 block.nonce + 
                 block.merkleRoot;
    return createHash(data);
  }

  // Calculate Merkle root for transactions
  private calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';
    if (transactions.length === 1) {
      return createHash(JSON.stringify(transactions[0]));
    }

    const hashes = transactions.map(tx => 
      createHash(JSON.stringify(tx))
    );

    while (hashes.length > 1) {
      const newLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left; // Duplicate if odd number
        const combined = createHash(left + right);
        newLevel.push(combined);
      }
      hashes.splice(0, hashes.length, ...newLevel);
    }

    return hashes[0];
  }

  // Get the latest block
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  // Add a new transaction
  addTransaction(transaction: Transaction): void {
    // Basic validation
    if (!transaction.id || !transaction.productId || !transaction.from || !transaction.action) {
      throw new Error('Invalid transaction data');
    }

    // Add timestamp if not provided
    if (!transaction.timestamp) {
      transaction.timestamp = Date.now();
    }

    this.pendingTransactions.push(transaction);
  }

  // Mine pending transactions into a new block
  minePendingTransactions(): Block | null {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    const newBlock: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: this.getLatestBlock().hash,
      hash: '',
      nonce: 0,
      merkleRoot: this.calculateMerkleRoot(this.pendingTransactions)
    };

    // Proof of work
    while (newBlock.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      newBlock.nonce++;
      newBlock.hash = this.calculateHash(newBlock);
    }

    console.log(`Block mined: ${newBlock.hash}`);
    this.chain.push(newBlock);
    
    // Process transactions to update products
    this.processTransactions(newBlock.transactions);
    
    // Clear pending transactions
    this.pendingTransactions = [];

    return newBlock;
  }

  // Process transactions to update product states
  private processTransactions(transactions: Transaction[]): void {
    transactions.forEach(tx => {
      switch (tx.action) {
        case 'create':
          this.createProduct(tx);
          break;
        case 'transfer':
          this.transferProduct(tx);
          break;
        case 'update':
          this.updateProduct(tx);
          break;
        case 'verify':
          this.verifyProduct(tx);
          break;
      }
    });
  }

  // Create a new product
  private createProduct(tx: Transaction): void {
    const product: Product = {
      id: tx.productId,
      name: tx.data.name,
      origin: tx.data.origin,
      farmer: tx.from,
      batchNumber: tx.data.batchNumber,
      harvestDate: tx.data.harvestDate,
      currentOwner: tx.from,
      status: 'harvested',
      certifications: tx.data.certifications || [],
      metadata: tx.data.metadata || {}
    };
    this.products.set(tx.productId, product);
  }

  // Transfer product ownership
  private transferProduct(tx: Transaction): void {
    const product = this.products.get(tx.productId);
    if (product && product.currentOwner === tx.from) {
      product.currentOwner = tx.to;
      product.status = tx.data.status || product.status;
      this.products.set(tx.productId, product);
    }
  }

  // Update product information
  private updateProduct(tx: Transaction): void {
    const product = this.products.get(tx.productId);
    if (product) {
      Object.assign(product, tx.data);
      this.products.set(tx.productId, product);
    }
  }

  // Verify product (add certification)
  private verifyProduct(tx: Transaction): void {
    const product = this.products.get(tx.productId);
    if (product) {
      product.certifications.push(tx.data.certification);
      if (tx.data.status) {
        product.status = tx.data.status;
      }
      this.products.set(tx.productId, product);
    }
  }

  // Get product by ID
  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  // Get all products
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  // Get transaction history for a product
  getProductHistory(productId: string): Transaction[] {
    const history: Transaction[] = [];
    
    this.chain.forEach(block => {
      block.transactions.forEach(tx => {
        if (tx.productId === productId) {
          history.push(tx);
        }
      });
    });
    
    return history.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Validate the entire blockchain
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block's hash is valid
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        console.error(`Invalid hash at block ${i}`);
        return false;
      }

      // Check if current block points to the previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Invalid previous hash at block ${i}`);
        return false;
      }

      // Check proof of work
      if (currentBlock.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
        console.error(`Invalid proof of work at block ${i}`);
        return false;
      }
    }

    return true;
  }

  // Get blockchain statistics
  getStats() {
    return {
      totalBlocks: this.chain.length,
      totalTransactions: this.chain.reduce((sum, block) => sum + block.transactions.length, 0),
      totalProducts: this.products.size,
      pendingTransactions: this.pendingTransactions.length,
      isValid: this.isChainValid()
    };
  }

  // Export blockchain data
  export(): any {
    return {
      chain: this.chain,
      products: Object.fromEntries(this.products),
      pendingTransactions: this.pendingTransactions
    };
  }

  // Import blockchain data
  import(data: any): void {
    this.chain = data.chain || [this.createGenesisBlock()];
    this.products = new Map(Object.entries(data.products || {}));
    this.pendingTransactions = data.pendingTransactions || [];
  }
}

// Create singleton instance
export const blockchain = new JSBlockchain();

// Utility functions
export const generateTransactionId = (): string => {
  const data = Date.now().toString() + Math.random().toString();
  return createHash(data).substring(0, 16);
};

export const generateProductId = (prefix: string = 'AGR'): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};

// Auto-mine pending transactions every 30 seconds in development
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (blockchain.getStats().pendingTransactions > 0) {
      blockchain.minePendingTransactions();
    }
  }, 30000);
}