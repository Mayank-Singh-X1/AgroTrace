import { expect } from 'chai';
import sinon from 'sinon';
import { VerificationService } from '../services/VerificationService';
import { BlockchainService } from '../services/BlockchainService';

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let blockchainService: BlockchainService;
  let mockContract: any;

  beforeEach(() => {
    // Create mock contract with stubbed methods
    mockContract = {
      recordVerification: sinon.stub().resolves({ wait: () => Promise.resolve() }),
      getProductVerifications: sinon.stub().resolves([
        {
          id: 'ver-1',
          productId: 'prod-1',
          verificationType: 'quality',
          result: 'passed',
          validUntil: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
          timestamp: Math.floor(Date.now() / 1000)
        }
      ]),
      isVerified: sinon.stub().resolves(true),
      verifyVerification: sinon.stub().resolves(true)
    };

    // Create mock blockchain service
    blockchainService = new BlockchainService();
    sinon.stub(blockchainService, 'getContract').returns(mockContract);
    sinon.stub(blockchainService, 'canWrite').returns(true);
    sinon.stub(blockchainService, 'getAccount').returns('0x1234567890123456789012345678901234567890');
    sinon.stub(blockchainService, 'isConnected').returns(true);

    // Create verification service with mocked blockchain service
    verificationService = new VerificationService(blockchainService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('recordVerification', () => {
    it('should record a verification successfully', async () => {
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
      
      const result = await verificationService.recordVerification(
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      );

      expect(result).to.be.true;
      expect(mockContract.recordVerification.calledOnce).to.be.true;
      expect(mockContract.recordVerification.firstCall.args).to.deep.equal([
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      ]);
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      const result = await verificationService.recordVerification(
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      );

      expect(result).to.be.false;
      expect(mockContract.recordVerification.called).to.be.false;
    });

    it('should return false when cannot write to blockchain', async () => {
      (blockchainService.canWrite as sinon.SinonStub).returns(false);
      
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      const result = await verificationService.recordVerification(
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      );

      expect(result).to.be.false;
      expect(mockContract.recordVerification.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.recordVerification.rejects(new Error('Contract error'));
      
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      const result = await verificationService.recordVerification(
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      );

      expect(result).to.be.false;
    });
  });

  describe('getProductVerifications', () => {
    it('should get product verifications successfully', async () => {
      const verifications = await verificationService.getProductVerifications('prod-1');

      expect(verifications.length).to.equal(1);
      expect(verifications[0].id).to.equal('ver-1');
      expect(verifications[0].productId).to.equal('prod-1');
      expect(mockContract.getProductVerifications.calledOnce).to.be.true;
      expect(mockContract.getProductVerifications.firstCall.args[0]).to.equal('prod-1');
    });

    it('should return empty array when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const verifications = await verificationService.getProductVerifications('prod-1');

      expect(verifications).to.be.an('array').that.is.empty;
      expect(mockContract.getProductVerifications.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.getProductVerifications.rejects(new Error('Contract error'));
      
      const verifications = await verificationService.getProductVerifications('prod-1');

      expect(verifications).to.be.an('array').that.is.empty;
    });
  });

  describe('isProductVerified', () => {
    it('should check if product is verified successfully', async () => {
      const result = await verificationService.isProductVerified('prod-1');

      expect(result).to.be.true;
      expect(mockContract.isVerified.calledOnce).to.be.true;
      expect(mockContract.isVerified.firstCall.args[0]).to.equal('prod-1');
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const result = await verificationService.isProductVerified('prod-1');

      expect(result).to.be.false;
      expect(mockContract.isVerified.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.isVerified.rejects(new Error('Contract error'));
      
      const result = await verificationService.isProductVerified('prod-1');

      expect(result).to.be.false;
    });
  });

  describe('verifyVerification', () => {
    it('should verify a verification record successfully', async () => {
      const result = await verificationService.verifyVerification('ver-1');

      expect(result).to.be.true;
      expect(mockContract.verifyVerification.calledOnce).to.be.true;
      expect(mockContract.verifyVerification.firstCall.args[0]).to.equal('ver-1');
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const result = await verificationService.verifyVerification('ver-1');

      expect(result).to.be.false;
      expect(mockContract.verifyVerification.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.verifyVerification.rejects(new Error('Contract error'));
      
      const result = await verificationService.verifyVerification('ver-1');

      expect(result).to.be.false;
    });
  });
});