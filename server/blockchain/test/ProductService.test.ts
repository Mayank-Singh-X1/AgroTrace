import { expect } from 'chai';
import sinon from 'sinon';
import { ProductService } from '../services/ProductService';
import { BlockchainService } from '../services/BlockchainService';

describe('ProductService', () => {
  let productService: ProductService;
  let blockchainService: BlockchainService;
  let mockContract: any;

  beforeEach(() => {
    // Create mock contract with stubbed methods
    mockContract = {
      createProduct: sinon.stub().resolves({ wait: () => Promise.resolve() }),
      getProduct: sinon.stub().resolves({
        id: 'prod-1',
        batchNumber: 'BATCH-001',
        name: 'Organic Apples',
        category: 'Fruits',
        producer: '0x1234567890123456789012345678901234567890',
        isVerified: false
      }),
      recordSupplyChainStage: sinon.stub().resolves({ wait: () => Promise.resolve() }),
      getProductStages: sinon.stub().resolves([
        {
          id: 'stage-1',
          productId: 'prod-1',
          stageType: 'harvesting',
          location: 'Farm Location',
          notes: 'Harvested on time',
          status: 'completed',
          timestamp: Math.floor(Date.now() / 1000)
        }
      ])
    };

    // Create mock blockchain service
    blockchainService = new BlockchainService();
    sinon.stub(blockchainService, 'getContract').returns(mockContract);
    sinon.stub(blockchainService, 'canWrite').returns(true);
    sinon.stub(blockchainService, 'getAccount').returns('0x1234567890123456789012345678901234567890');
    sinon.stub(blockchainService, 'isConnected').returns(true);

    // Create product service with mocked blockchain service
    productService = new ProductService(blockchainService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const result = await productService.createProduct(
        'prod-1',
        'BATCH-001',
        'Organic Apples',
        'Fruits'
      );

      expect(result).to.be.true;
      expect(mockContract.createProduct.calledOnce).to.be.true;
      expect(mockContract.createProduct.firstCall.args).to.deep.equal([
        'prod-1',
        'BATCH-001',
        'Organic Apples',
        'Fruits'
      ]);
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const result = await productService.createProduct(
        'prod-1',
        'BATCH-001',
        'Organic Apples',
        'Fruits'
      );

      expect(result).to.be.false;
      expect(mockContract.createProduct.called).to.be.false;
    });

    it('should return false when cannot write to blockchain', async () => {
      (blockchainService.canWrite as sinon.SinonStub).returns(false);
      
      const result = await productService.createProduct(
        'prod-1',
        'BATCH-001',
        'Organic Apples',
        'Fruits'
      );

      expect(result).to.be.false;
      expect(mockContract.createProduct.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.createProduct.rejects(new Error('Contract error'));
      
      const result = await productService.createProduct(
        'prod-1',
        'BATCH-001',
        'Organic Apples',
        'Fruits'
      );

      expect(result).to.be.false;
    });
  });

  describe('getProduct', () => {
    it('should get product details successfully', async () => {
      const product = await productService.getProduct('prod-1');

      expect(product).to.deep.equal({
        id: 'prod-1',
        batchNumber: 'BATCH-001',
        name: 'Organic Apples',
        category: 'Fruits',
        producer: '0x1234567890123456789012345678901234567890',
        isVerified: false
      });
      expect(mockContract.getProduct.calledOnce).to.be.true;
      expect(mockContract.getProduct.firstCall.args[0]).to.equal('prod-1');
    });

    it('should return null when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const product = await productService.getProduct('prod-1');

      expect(product).to.be.null;
      expect(mockContract.getProduct.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.getProduct.rejects(new Error('Contract error'));
      
      const product = await productService.getProduct('prod-1');

      expect(product).to.be.null;
    });
  });

  describe('recordSupplyChainStage', () => {
    it('should record supply chain stage successfully', async () => {
      const result = await productService.recordSupplyChainStage(
        'stage-1',
        'prod-1',
        'harvesting',
        'Farm Location',
        'Harvested on time',
        'completed'
      );

      expect(result).to.be.true;
      expect(mockContract.recordSupplyChainStage.calledOnce).to.be.true;
      expect(mockContract.recordSupplyChainStage.firstCall.args).to.deep.equal([
        'stage-1',
        'prod-1',
        'harvesting',
        'Farm Location',
        'Harvested on time',
        'completed'
      ]);
    });
  });

  describe('getProductStages', () => {
    it('should get product stages successfully', async () => {
      const stages = await productService.getProductStages('prod-1');

      expect(stages.length).to.equal(1);
      expect(stages[0].id).to.equal('stage-1');
      expect(stages[0].productId).to.equal('prod-1');
      expect(mockContract.getProductStages.calledOnce).to.be.true;
      expect(mockContract.getProductStages.firstCall.args[0]).to.equal('prod-1');
    });
  });
});