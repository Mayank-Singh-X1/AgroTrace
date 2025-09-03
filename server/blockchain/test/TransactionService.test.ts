import { expect } from 'chai';
import sinon from 'sinon';
import { TransactionService } from '../services/TransactionService';
import { BlockchainService } from '../services/BlockchainService';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let blockchainService: BlockchainService;
  let mockContract: any;

  beforeEach(() => {
    // Create mock contract with stubbed methods
    mockContract = {
      recordTransaction: sinon.stub().resolves({ wait: () => Promise.resolve() }),
      getProductTransactions: sinon.stub().resolves([
        {
          id: 'tx-1',
          productId: 'prod-1',
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          txType: 'transfer',
          quantity: 100,
          price: 50,
          timestamp: Math.floor(Date.now() / 1000)
        }
      ]),
      verifyTransaction: sinon.stub().resolves(true)
    };

    // Create mock blockchain service
    blockchainService = new BlockchainService();
    sinon.stub(blockchainService, 'getContract').returns(mockContract);
    sinon.stub(blockchainService, 'canWrite').returns(true);
    sinon.stub(blockchainService, 'getAccount').returns('0x1234567890123456789012345678901234567890');
    sinon.stub(blockchainService, 'isConnected').returns(true);

    // Create transaction service with mocked blockchain service
    transactionService = new TransactionService(blockchainService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('recordTransaction', () => {
    it('should record a transaction successfully', async () => {
      const result = await transactionService.recordTransaction(
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      );

      expect(result).to.be.true;
      expect(mockContract.recordTransaction.calledOnce).to.be.true;
      expect(mockContract.recordTransaction.firstCall.args).to.deep.equal([
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      ]);
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const result = await transactionService.recordTransaction(
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      );

      expect(result).to.be.false;
      expect(mockContract.recordTransaction.called).to.be.false;
    });

    it('should return false when cannot write to blockchain', async () => {
      (blockchainService.canWrite as sinon.SinonStub).returns(false);
      
      const result = await transactionService.recordTransaction(
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      );

      expect(result).to.be.false;
      expect(mockContract.recordTransaction.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.recordTransaction.rejects(new Error('Contract error'));
      
      const result = await transactionService.recordTransaction(
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      );

      expect(result).to.be.false;
    });
  });

  describe('getProductTransactions', () => {
    it('should get product transactions successfully', async () => {
      const transactions = await transactionService.getProductTransactions('prod-1');

      expect(transactions.length).to.equal(1);
      expect(transactions[0].id).to.equal('tx-1');
      expect(transactions[0].productId).to.equal('prod-1');
      expect(mockContract.getProductTransactions.calledOnce).to.be.true;
      expect(mockContract.getProductTransactions.firstCall.args[0]).to.equal('prod-1');
    });

    it('should return empty array when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const transactions = await transactionService.getProductTransactions('prod-1');

      expect(transactions).to.be.an('array').that.is.empty;
      expect(mockContract.getProductTransactions.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.getProductTransactions.rejects(new Error('Contract error'));
      
      const transactions = await transactionService.getProductTransactions('prod-1');

      expect(transactions).to.be.an('array').that.is.empty;
    });
  });

  describe('verifyTransaction', () => {
    it('should verify a transaction successfully', async () => {
      const result = await transactionService.verifyTransaction('tx-1');

      expect(result).to.be.true;
      expect(mockContract.verifyTransaction.calledOnce).to.be.true;
      expect(mockContract.verifyTransaction.firstCall.args[0]).to.equal('tx-1');
    });

    it('should return false when blockchain is not connected', async () => {
      (blockchainService.isConnected as sinon.SinonStub).returns(false);
      
      const result = await transactionService.verifyTransaction('tx-1');

      expect(result).to.be.false;
      expect(mockContract.verifyTransaction.called).to.be.false;
    });

    it('should handle errors gracefully', async () => {
      mockContract.verifyTransaction.rejects(new Error('Contract error'));
      
      const result = await transactionService.verifyTransaction('tx-1');

      expect(result).to.be.false;
    });
  });
});