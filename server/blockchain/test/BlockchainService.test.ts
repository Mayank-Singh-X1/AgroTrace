import { expect } from 'chai';
import { BlockchainService } from '../services/BlockchainService';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

describe('BlockchainService', () => {
  let blockchainService: BlockchainService;

  beforeEach(() => {
    // Create a new instance of BlockchainService for each test
    blockchainService = new BlockchainService();
  });

  describe('initialization', () => {
    it('should initialize with default provider', () => {
      expect(blockchainService).to.be.instanceOf(BlockchainService);
      expect(blockchainService.isConnected()).to.be.false;
    });

    it('should connect to provider when initialized with valid parameters', async () => {
      // This test assumes you have a local Hardhat node running
      const localService = new BlockchainService('http://127.0.0.1:8545');
      expect(localService.isConnected()).to.be.true;
    });
  });

  describe('contract interaction', () => {
    it('should load contract ABI', () => {
      const contract = blockchainService.getContract();
      expect(contract).to.not.be.undefined;
    });

    it('should determine write capability based on private key', () => {
      // Without private key
      expect(blockchainService.canWrite()).to.be.false;

      // With private key (mock)
      const serviceWithKey = new BlockchainService(
        'http://127.0.0.1:8545',
        '0x0123456789012345678901234567890123456789012345678901234567890123', // Mock private key
        '0x0000000000000000000000000000000000000000' // Mock contract address
      );
      expect(serviceWithKey.canWrite()).to.be.true;
    });
  });

  describe('account management', () => {
    it('should return empty address when no wallet is configured', () => {
      expect(blockchainService.getAccount()).to.equal('');
    });

    it('should return wallet address when configured with private key', () => {
      const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123'; // Mock private key
      const serviceWithKey = new BlockchainService(
        'http://127.0.0.1:8545',
        privateKey,
        '0x0000000000000000000000000000000000000000' // Mock contract address
      );
      
      // The address should be derived from the private key
      const wallet = new ethers.Wallet(privateKey);
      expect(serviceWithKey.getAccount()).to.equal(wallet.address);
    });
  });
});