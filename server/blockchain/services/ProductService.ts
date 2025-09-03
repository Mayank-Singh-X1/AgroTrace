import { blockchainService } from './BlockchainService';

interface ProductData {
  id: string;
  batchNumber: string;
  name: string;
  category: string;
}

interface SupplyChainStageData {
  id: string;
  productId: string;
  stageType: string;
  location: string;
  notes?: string;
  status?: string;
}

class ProductService {
  /**
   * Create a product on the blockchain
   */
  async createProduct(data: ProductData): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Check if blockchain service is ready for write operations
      if (!blockchainService.canWrite()) {
        throw new Error('Blockchain write operations not available');
      }

      const contract = blockchainService.getContract();
      
      // Create product on blockchain
      const tx = await contract.createProduct(
        data.id,
        data.batchNumber,
        data.name,
        data.category
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error creating product on blockchain:', error);
      return {
        success: false,
        error: error.message || 'Unknown error creating product'
      };
    }
  }

  /**
   * Get product details from the blockchain
   */
  async getProduct(productId: string): Promise<any | null> {
    try {
      const contract = blockchainService.getContract();
      const product = await contract.getProduct(productId);
      
      // Transform blockchain data to application format
      return {
        id: product.id,
        batchNumber: product.batchNumber,
        name: product.name,
        category: product.category,
        producerAddress: product.producer,
        timestamp: new Date(Number(product.timestamp) * 1000).toISOString(),
        isVerified: product.isVerified,
        blockchainVerified: true
      };
    } catch (error) {
      console.error('Error getting product from blockchain:', error);
      return null;
    }
  }

  /**
   * Record a supply chain stage on the blockchain
   */
  async recordSupplyChainStage(data: SupplyChainStageData): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Check if blockchain service is ready for write operations
      if (!blockchainService.canWrite()) {
        throw new Error('Blockchain write operations not available');
      }

      const contract = blockchainService.getContract();
      
      // Record supply chain stage on blockchain
      const tx = await contract.recordStage(
        data.id,
        data.productId,
        data.stageType,
        data.location,
        data.notes || '',
        data.status || 'completed'
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error recording supply chain stage on blockchain:', error);
      return {
        success: false,
        error: error.message || 'Unknown error recording supply chain stage'
      };
    }
  }

  /**
   * Get supply chain stages for a product from the blockchain
   */
  async getProductStages(productId: string): Promise<any[]> {
    try {
      const contract = blockchainService.getContract();
      const stages = await contract.getProductStages(productId);
      
      // Transform blockchain data to application format
      return stages.map((stage: any) => ({
        id: stage.id,
        productId: stage.productId,
        stageType: stage.stageType,
        handlerAddress: stage.handler,
        location: stage.location,
        timestamp: new Date(Number(stage.timestamp) * 1000).toISOString(),
        notes: stage.notes,
        status: stage.status,
        blockchainVerified: true
      }));
    } catch (error) {
      console.error('Error getting product stages from blockchain:', error);
      return [];
    }
  }
}

// Export singleton instance
export const productService = new ProductService();