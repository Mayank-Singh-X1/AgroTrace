import { blockchainService } from './BlockchainService';
import { randomUUID } from 'crypto';

interface TransactionData {
  productId: string;
  fromUserId: string;
  toUserId: string;
  transactionType: string;
  quantity: number;
  price?: number;
}

class TransactionService {
  /**
   * Record a transaction on the blockchain
   */
  async recordTransaction(data: TransactionData): Promise<{ success: boolean; txHash?: string; blockchainHash?: string; error?: string }> {
    try {
      // Check if blockchain service is ready for write operations
      if (!blockchainService.canWrite()) {
        throw new Error('Blockchain write operations not available');
      }

      const contract = blockchainService.getContract();
      const transactionId = randomUUID();
      
      // Convert user IDs to Ethereum addresses (in a real app, you'd have a mapping)
      // For now, we'll use placeholder addresses
      const toAddress = '0x0000000000000000000000000000000000000000';
      
      // Record transaction on blockchain
      const tx = await contract.recordTransaction(
        transactionId,
        data.productId,
        toAddress,
        data.transactionType,
        data.quantity,
        data.price || 0
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockchainHash: receipt.blockHash
      };
    } catch (error: any) {
      console.error('Error recording transaction on blockchain:', error);
      return {
        success: false,
        error: error.message || 'Unknown error recording transaction'
      };
    }
  }

  /**
   * Get transactions for a product from the blockchain
   */
  async getProductTransactions(productId: string): Promise<any[]> {
    try {
      const contract = blockchainService.getContract();
      const transactions = await contract.getProductTransactions(productId);
      
      // Transform blockchain data to application format
      return transactions.map((tx: any) => ({
        id: tx.id,
        productId: tx.productId,
        fromAddress: tx.from,
        toAddress: tx.to,
        transactionType: tx.txType,
        quantity: Number(tx.quantity),
        price: Number(tx.price),
        timestamp: new Date(Number(tx.timestamp) * 1000).toISOString(),
        blockchainVerified: true
      }));
    } catch (error) {
      console.error('Error getting product transactions from blockchain:', error);
      return [];
    }
  }

  /**
   * Verify a transaction on the blockchain
   */
  async verifyTransaction(transactionId: string, productId: string): Promise<boolean> {
    try {
      const contract = blockchainService.getContract();
      const transactions = await contract.getProductTransactions(productId);
      
      // Check if transaction exists on blockchain
      const found = transactions.some((tx: any) => tx.id === transactionId);
      return found;
    } catch (error) {
      console.error('Error verifying transaction on blockchain:', error);
      return false;
    }
  }
}

// Export singleton instance
export const transactionService = new TransactionService();