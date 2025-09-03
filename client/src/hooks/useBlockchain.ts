import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AgroChainProduct__factory } from '../../../typechain-types/factories/server/blockchain/contracts/AgroChainProduct__factory';

// Import ABI from the generated typechain types
const CONTRACT_ABI = AgroChainProduct__factory.abi;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

interface BlockchainState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  account: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useBlockchain() {
  const [state, setState] = useState<BlockchainState>({
    provider: null,
    signer: null,
    contract: null,
    account: null,
    connected: false,
    connecting: false,
    error: null,
  });

  // Connect to blockchain
  const connect = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      
      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setState({
        provider,
        signer,
        contract,
        account,
        connected: true,
        connecting: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: error.message || 'Failed to connect to blockchain',
      }));
    }
  };

  // Disconnect from blockchain
  const disconnect = () => {
    setState({
      provider: null,
      signer: null,
      contract: null,
      account: null,
      connected: false,
      connecting: false,
      error: null,
    });
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connect();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.account !== accounts[0]) {
        connect();
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Product operations
  const createProduct = async (id: string, batchNumber: string, name: string, category: string) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const tx = await state.contract.createProduct(id, batchNumber, name, category);
    await tx.wait();
    return tx.hash;
  };

  const getProduct = async (id: string) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const product = await state.contract.getProduct(id);
    return product;
  };

  // Transaction operations
  const recordTransaction = async (
    id: string,
    productId: string,
    toAddress: string,
    txType: string,
    quantity: number,
    price: number
  ) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const tx = await state.contract.recordTransaction(
      id,
      productId,
      toAddress,
      txType,
      quantity,
      price
    );
    await tx.wait();
    return tx.hash;
  };

  const getProductTransactions = async (productId: string) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const transactions = await state.contract.getProductTransactions(productId);
    return transactions;
  };

  // Verification operations
  const recordVerification = async (
    id: string,
    productId: string,
    verificationType: string,
    result: string,
    validUntil: number
  ) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const tx = await state.contract.recordVerification(
      id,
      productId,
      verificationType,
      result,
      validUntil
    );
    await tx.wait();
    return tx.hash;
  };

  const getProductVerifications = async (productId: string) => {
    if (!state.contract) throw new Error('Not connected to blockchain');
    
    const verifications = await state.contract.getProductVerifications(productId);
    return verifications;
  };

  return {
    ...state,
    connect,
    disconnect,
    createProduct,
    getProduct,
    recordTransaction,
    getProductTransactions,
    recordVerification,
    getProductVerifications,
  };
}