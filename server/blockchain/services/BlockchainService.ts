import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Load contract ABI
const getContractABI = () => {
  try {
    const artifactPath = path.resolve(
      __dirname,
      '../artifacts/server/blockchain/contracts/AgroChainProduct.sol/AgroChainProduct.json'
    );
    const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return contractArtifact.abi;
  } catch (error) {
    console.error('Error loading contract ABI:', error);
    throw new Error('Failed to load contract ABI');
  }
};

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    // Initialize provider based on environment
    const rpcUrl = process.env.NODE_ENV === 'production'
      ? process.env.MAINNET_RPC_URL
      : process.env.NODE_ENV === 'test'
        ? process.env.SEPOLIA_RPC_URL
        : 'http://localhost:8545'; // Default to local Hardhat node

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';

    // Initialize wallet if private key is available
    if (process.env.PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Initialize contract
      if (this.contractAddress) {
        try {
          const abi = getContractABI();
          this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      } else {
        console.warn('Contract address not provided. Some functions will be unavailable.');
      }
    } else {
      console.warn('Private key not provided. Read-only mode enabled.');
    }
  }

  /**
   * Get the current blockchain connection status
   */
  async getConnectionStatus(): Promise<{ connected: boolean; network?: string; blockNumber?: number }> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      return {
        connected: true,
        network: network.name,
        blockNumber,
      };
    } catch (error) {
      console.error('Blockchain connection error:', error);
      return { connected: false };
    }
  }

  /**
   * Get contract instance (read-only if no wallet is available)
   */
  getContract(): ethers.Contract {
    if (!this.contractAddress) {
      throw new Error('Contract address not configured');
    }

    if (!this.contract) {
      const abi = getContractABI();
      // Use provider for read-only operations if wallet is not available
      this.contract = new ethers.Contract(
        this.contractAddress,
        abi,
        this.wallet || this.provider
      );
    }

    return this.contract;
  }

  /**
   * Check if write operations are available (requires wallet)
   */
  canWrite(): boolean {
    return !!this.wallet && !!this.contract;
  }

  /**
   * Get the current account address
   */
  getAccountAddress(): string | null {
    return this.wallet ? this.wallet.address : null;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();