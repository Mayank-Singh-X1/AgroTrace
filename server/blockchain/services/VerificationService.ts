import { blockchainService } from './BlockchainService';
import { randomUUID } from 'crypto';

interface VerificationData {
  productId: string;
  verifierId: string;
  verificationType: string;
  result: string;
  validUntil?: number; // Unix timestamp
}

class VerificationService {
  /**
   * Record a verification on the blockchain
   */
  async recordVerification(data: VerificationData): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Check if blockchain service is ready for write operations
      if (!blockchainService.canWrite()) {
        throw new Error('Blockchain write operations not available');
      }

      const contract = blockchainService.getContract();
      const verificationId = randomUUID();
      
      // Calculate validUntil if not provided (default to 1 year)
      const validUntil = data.validUntil || Math.floor(Date.now() / 1000) + 31536000; // 1 year in seconds
      
      // Record verification on blockchain
      const tx = await contract.recordVerification(
        verificationId,
        data.productId,
        data.verificationType,
        data.result,
        validUntil
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error recording verification on blockchain:', error);
      return {
        success: false,
        error: error.message || 'Unknown error recording verification'
      };
    }
  }

  /**
   * Get verifications for a product from the blockchain
   */
  async getProductVerifications(productId: string): Promise<any[]> {
    try {
      const contract = blockchainService.getContract();
      const verifications = await contract.getProductVerifications(productId);
      
      // Transform blockchain data to application format
      return verifications.map((v: any) => ({
        id: v.id,
        productId: v.productId,
        verifierAddress: v.verifier,
        verificationType: v.verificationType,
        result: v.result,
        timestamp: new Date(Number(v.timestamp) * 1000).toISOString(),
        validUntil: new Date(Number(v.validUntil) * 1000).toISOString(),
        blockchainVerified: true
      }));
    } catch (error) {
      console.error('Error getting product verifications from blockchain:', error);
      return [];
    }
  }

  /**
   * Check if a product is verified on the blockchain
   */
  async isProductVerified(productId: string): Promise<boolean> {
    try {
      const contract = blockchainService.getContract();
      const product = await contract.getProduct(productId);
      return product.isVerified;
    } catch (error) {
      console.error('Error checking product verification status:', error);
      return false;
    }
  }

  /**
   * Verify a specific verification record exists on the blockchain
   */
  async verifyVerificationRecord(verificationId: string, productId: string): Promise<boolean> {
    try {
      const contract = blockchainService.getContract();
      const verifications = await contract.getProductVerifications(productId);
      
      // Check if verification exists on blockchain
      const found = verifications.some((v: any) => v.id === verificationId);
      return found;
    } catch (error) {
      console.error('Error verifying verification record on blockchain:', error);
      return false;
    }
  }
}

// Export singleton instance
export const verificationService = new VerificationService();