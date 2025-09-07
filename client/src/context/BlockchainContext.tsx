import React, { createContext, useContext, ReactNode } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { ethers } from 'ethers';

interface BlockchainContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  account: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  createProduct: (id: string, batchNumber: string, name: string, category: string) => Promise<string>;
  getProduct: (id: string) => Promise<any>;
  recordTransaction: (
    id: string,
    productId: string,
    toAddress: string,
    txType: string,
    quantity: number,
    price: number
  ) => Promise<string>;
  getProductTransactions: (productId: string) => Promise<any[]>;
  recordVerification: (
    id: string,
    productId: string,
    verificationType: string,
    result: string,
    validUntil: number
  ) => Promise<string>;
  getProductVerifications: (productId: string) => Promise<any[]>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const blockchain = useBlockchain();

  return (
    <BlockchainContext.Provider value={blockchain}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchainContext() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchainContext must be used within a BlockchainProvider');
  }
  return context;
}