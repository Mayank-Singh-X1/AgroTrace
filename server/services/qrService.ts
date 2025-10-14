import QRCode from 'qrcode';
import { Product, SupplyChainStage, Verification } from '@shared/schema';

export interface QRCodeData {
  productId: string;
  batchNumber: string;
  name: string;
  farmer: string;
  harvestDate: string | null;
  status: string;
  verificationUrl: string;
  trackingUrl: string;
  timestamp: number;
}

export interface ProductLookupData {
  product: Product;
  supplyChain: SupplyChainStage[];
  verifications: Verification[];
  qrData: QRCodeData;
}

export class QRCodeService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate QR code data for a product
   */
  generateQRData(product: Product, farmerName?: string): QRCodeData {
    const qrData: QRCodeData = {
      productId: product.id,
      batchNumber: product.batchNumber,
      name: product.name,
      farmer: farmerName || 'Unknown Farmer',
      harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString() : null,
      status: product.status,
      verificationUrl: `${this.baseUrl}/verify/${product.batchNumber}`,
      trackingUrl: `${this.baseUrl}/track/${product.batchNumber}`,
      timestamp: Date.now()
    };

    return qrData;
  }

  /**
   * Generate QR code as base64 image
   */
  async generateQRCode(qrData: QRCodeData): Promise<string> {
    try {
      const qrContent = JSON.stringify({
        id: qrData.productId,
        batch: qrData.batchNumber,
        name: qrData.name,
        farmer: qrData.farmer,
        harvest: qrData.harvestDate,
        status: qrData.status,
        verify: qrData.verificationUrl,
        track: qrData.trackingUrl,
        timestamp: qrData.timestamp
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as SVG string
   */
  async generateQRCodeSVG(qrData: QRCodeData): Promise<string> {
    try {
      const qrContent = JSON.stringify({
        id: qrData.productId,
        batch: qrData.batchNumber,
        name: qrData.name,
        farmer: qrData.farmer,
        harvest: qrData.harvestDate,
        status: qrData.status,
        verify: qrData.verificationUrl,
        track: qrData.trackingUrl,
        timestamp: qrData.timestamp
      });

      const qrCodeSVG = await QRCode.toString(qrContent, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256
      });

      return qrCodeSVG;
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  /**
   * Generate simple tracking URL QR code
   */
  async generateTrackingQR(batchNumber: string): Promise<string> {
    try {
      const trackingUrl = `${this.baseUrl}/lookup/${batchNumber}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(trackingUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#10B981', // Green color for agricultural theme
          light: '#FFFFFF',
        },
        width: 200
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating tracking QR code:', error);
      throw new Error('Failed to generate tracking QR code');
    }
  }

  /**
   * Parse QR code data from scanned content
   */
  parseQRCode(qrContent: string): QRCodeData | null {
    try {
      const parsed = JSON.parse(qrContent);
      
      // Validate required fields
      if (!parsed.id || !parsed.batch || !parsed.name) {
        return null;
      }

      return {
        productId: parsed.id,
        batchNumber: parsed.batch,
        name: parsed.name,
        farmer: parsed.farmer || 'Unknown Farmer',
        harvestDate: parsed.harvest || null,
        status: parsed.status || 'unknown',
        verificationUrl: parsed.verify || '',
        trackingUrl: parsed.track || '',
        timestamp: parsed.timestamp || 0
      };
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  }

  /**
   * Generate product label data for printing
   */
  generateProductLabel(product: Product, qrData: QRCodeData, qrCodeImage: string) {
    return {
      productInfo: {
        name: product.name,
        batchNumber: product.batchNumber,
        productType: product.productType,
        quantity: `${product.quantity} ${product.unit}`,
        harvestDate: product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A',
        expiryDate: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A',
        status: product.status.replace('_', ' ').toUpperCase()
      },
      qrCode: {
        image: qrCodeImage,
        data: qrData
      },
      instructions: {
        consumer: 'Scan QR code to verify product authenticity and trace supply chain',
        retailer: 'Use batch number for inventory tracking and customer inquiries'
      },
      generatedAt: new Date().toISOString(),
      printReady: true
    };
  }

  /**
   * Generate batch QR codes for multiple products
   */
  async generateBatchQRCodes(products: Product[], farmerNames: Map<string, string> = new Map()): Promise<Map<string, string>> {
    const qrCodes = new Map<string, string>();
    
    for (const product of products) {
      try {
        const farmerName = farmerNames.get(product.createdBy) || 'Unknown Farmer';
        const qrData = this.generateQRData(product, farmerName);
        const qrCode = await this.generateQRCode(qrData);
        qrCodes.set(product.id, qrCode);
      } catch (error) {
        console.error(`Failed to generate QR code for product ${product.id}:`, error);
        // Continue with other products
      }
    }
    
    return qrCodes;
  }

  /**
   * Validate QR code content
   */
  isValidQRContent(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      return !!(parsed.id && parsed.batch && parsed.name);
    } catch {
      return false;
    }
  }

  /**
   * Generate QR code for supply chain stage
   */
  async generateStageQR(stage: SupplyChainStage, productName: string): Promise<string> {
    try {
      const stageData = {
        type: 'supply_chain_stage',
        stageId: stage.id,
        productId: stage.productId,
        productName: productName,
        stageName: stage.stageName,
        stageType: stage.stageType,
        location: stage.location,
        timestamp: stage.timestamp,
        handler: stage.handlerId,
        verificationUrl: `${this.baseUrl}/verify/stage/${stage.id}`
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(stageData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#3B82F6', // Blue for supply chain stages
          light: '#FFFFFF',
        },
        width: 200
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating stage QR code:', error);
      throw new Error('Failed to generate stage QR code');
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();