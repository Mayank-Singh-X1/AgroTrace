import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  blockchain, 
  generateTransactionId, 
  generateProductId,
  type Transaction,
  type Product,
  type Block
} from "@/lib/blockchain";

interface BlockchainState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalBlocks: number;
    totalTransactions: number;
    totalProducts: number;
    pendingTransactions: number;
    isValid: boolean;
  };
}

interface BlockchainContextType extends BlockchainState {
  createProduct: (productData: any) => Promise<Product>;
  transferProduct: (productId: string, to: string, status?: string) => Promise<Transaction>;
  verifyProduct: (productId: string, certification: string) => Promise<Transaction>;
  updateProduct: (productId: string, updates: any) => Promise<Transaction>;
  getProduct: (productId: string) => Product | undefined;
  getAllProducts: () => Product[];
  getProductHistory: (productId: string) => Transaction[];
  mineBlock: () => Promise<Block | null>;
  refreshStats: () => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BlockchainState>({
    isConnected: true, // Always connected since it's our internal blockchain
    isLoading: false,
    error: null,
    stats: {
      totalBlocks: 0,
      totalTransactions: 0,
      totalProducts: 0,
      pendingTransactions: 0,
      isValid: true
    }
  });
  const { toast } = useToast();

  const updateStats = () => {
    const newStats = blockchain.getStats();
    setState(prev => ({ ...prev, stats: newStats }));
  };

  const createProduct = async (productData: any): Promise<Product> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const productId = generateProductId();
      const transaction: Transaction = {
        id: generateTransactionId(),
        productId,
        from: productData.farmer || 'farmer_address',
        to: productData.farmer || 'farmer_address',
        action: 'create',
        data: {
          name: productData.name,
          origin: productData.origin,
          batchNumber: productData.batchNumber,
          harvestDate: productData.harvestDate,
          certifications: productData.certifications || [],
          metadata: productData.metadata || {}
        },
        timestamp: Date.now()
      };
      
      blockchain.addTransaction(transaction);
      
      // Auto-mine the block for immediate feedback
      const block = blockchain.minePendingTransactions();
      
      const product = blockchain.getProduct(productId);
      if (!product) {
        throw new Error('Failed to create product');
      }
      
      updateStats();
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Product Created',
        description: `Product ${productData.name} has been registered on the blockchain`,
      });
      
      return product;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      toast({
        title: 'Product Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const transferProduct = async (productId: string, to: string, status?: string): Promise<Transaction> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const product = blockchain.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const transaction: Transaction = {
        id: generateTransactionId(),
        productId,
        from: product.currentOwner,
        to,
        action: 'transfer',
        data: { status },
        timestamp: Date.now()
      };
      
      blockchain.addTransaction(transaction);
      blockchain.minePendingTransactions();
      
      updateStats();
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Product Transferred',
        description: `Product ownership transferred to ${to}`,
      });
      
      return transaction;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      toast({
        title: 'Transfer Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const verifyProduct = async (productId: string, certification: string): Promise<Transaction> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const product = blockchain.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const transaction: Transaction = {
        id: generateTransactionId(),
        productId,
        from: 'verifier_address',
        to: product.currentOwner,
        action: 'verify',
        data: { certification },
        timestamp: Date.now()
      };
      
      blockchain.addTransaction(transaction);
      blockchain.minePendingTransactions();
      
      updateStats();
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Product Verified',
        description: `Product has been certified: ${certification}`,
      });
      
      return transaction;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: any): Promise<Transaction> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const product = blockchain.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const transaction: Transaction = {
        id: generateTransactionId(),
        productId,
        from: product.currentOwner,
        to: product.currentOwner,
        action: 'update',
        data: updates,
        timestamp: Date.now()
      };
      
      blockchain.addTransaction(transaction);
      blockchain.minePendingTransactions();
      
      updateStats();
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Product Updated',
        description: 'Product information has been updated on the blockchain',
      });
      
      return transaction;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getProduct = (productId: string): Product | undefined => {
    return blockchain.getProduct(productId);
  };

  const getAllProducts = (): Product[] => {
    return blockchain.getAllProducts();
  };

  const getProductHistory = (productId: string): Transaction[] => {
    return blockchain.getProductHistory(productId);
  };

  const mineBlock = async (): Promise<Block | null> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const block = blockchain.minePendingTransactions();
      updateStats();
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (block) {
        toast({
          title: 'Block Mined',
          description: `New block #${block.index} has been mined`,
        });
      }
      
      return block;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      throw error;
    }
  };

  const refreshStats = () => {
    updateStats();
  };

  // Initialize stats on mount
  useEffect(() => {
    updateStats();
    
    // Set up periodic stats updates
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const contextValue: BlockchainContextType = {
    ...state,
    createProduct,
    transferProduct,
    verifyProduct,
    updateProduct,
    getProduct,
    getAllProducts,
    getProductHistory,
    mineBlock,
    refreshStats,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}
