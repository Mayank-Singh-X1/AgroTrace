import { renderHook, act } from '@testing-library/react';
import { useBlockchain } from './useBlockchain';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    BrowserProvider: jest.fn(),
    Contract: jest.fn()
  };
});

describe('useBlockchain', () => {
  let mockProvider: any;
  let mockSigner: any;
  let mockContract: any;
  let mockWindow: any;

  beforeEach(() => {
    // Mock contract methods
    mockContract = {
      createProduct: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      getProduct: jest.fn().mockResolvedValue({
        id: 'prod-1',
        batchNumber: 'BATCH-001',
        name: 'Organic Apples',
        category: 'Fruits',
        producer: '0x1234567890123456789012345678901234567890',
        isVerified: false
      }),
      recordTransaction: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      getProductTransactions: jest.fn().mockResolvedValue([{
        id: 'tx-1',
        productId: 'prod-1',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        txType: 'transfer',
        quantity: 100,
        price: 50,
        timestamp: Math.floor(Date.now() / 1000)
      }]),
      recordVerification: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      getProductVerifications: jest.fn().mockResolvedValue([{
        id: 'ver-1',
        productId: 'prod-1',
        verificationType: 'quality',
        result: 'passed',
        validUntil: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        timestamp: Math.floor(Date.now() / 1000)
      }])
    };

    // Mock signer
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };

    // Mock provider
    mockProvider = {
      getSigner: jest.fn().mockResolvedValue(mockSigner)
    };

    // Mock window.ethereum
    mockWindow = {
      ethereum: {
        request: jest.fn().mockImplementation((request) => {
          if (request.method === 'eth_requestAccounts') {
            return Promise.resolve(['0x1234567890123456789012345678901234567890']);
          }
          return Promise.resolve();
        })
      }
    };

    // Setup mocks
    global.window = mockWindow;
    (ethers.BrowserProvider as jest.Mock).mockImplementation(() => mockProvider);
    (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useBlockchain());
    
    expect(result.current.connected).toBe(false);
    expect(result.current.account).toBe('');
    expect(result.current.contract).toBeNull();
  });

  it('should connect to blockchain', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.connected).toBe(true);
    expect(result.current.account).toBe('0x1234567890123456789012345678901234567890');
    expect(result.current.contract).not.toBeNull();
    expect(mockWindow.ethereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
  });

  it('should disconnect from blockchain', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
      result.current.disconnect();
    });
    
    expect(result.current.connected).toBe(false);
    expect(result.current.account).toBe('');
    expect(result.current.contract).toBeNull();
  });

  it('should create a product', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    await act(async () => {
      await result.current.createProduct('prod-1', 'BATCH-001', 'Organic Apples', 'Fruits');
    });
    
    expect(mockContract.createProduct).toHaveBeenCalledWith(
      'prod-1',
      'BATCH-001',
      'Organic Apples',
      'Fruits'
    );
  });

  it('should get a product', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    let product;
    await act(async () => {
      product = await result.current.getProduct('prod-1');
    });
    
    expect(mockContract.getProduct).toHaveBeenCalledWith('prod-1');
    expect(product).toEqual({
      id: 'prod-1',
      batchNumber: 'BATCH-001',
      name: 'Organic Apples',
      category: 'Fruits',
      producer: '0x1234567890123456789012345678901234567890',
      isVerified: false
    });
  });

  it('should record a transaction', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    await act(async () => {
      await result.current.recordTransaction(
        'tx-1',
        'prod-1',
        '0x0987654321098765432109876543210987654321',
        'transfer',
        100,
        50
      );
    });
    
    expect(mockContract.recordTransaction).toHaveBeenCalledWith(
      'tx-1',
      'prod-1',
      '0x0987654321098765432109876543210987654321',
      'transfer',
      100,
      50
    );
  });

  it('should get product transactions', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    let transactions;
    await act(async () => {
      transactions = await result.current.getProductTransactions('prod-1');
    });
    
    expect(mockContract.getProductTransactions).toHaveBeenCalledWith('prod-1');
    expect(transactions.length).toBe(1);
    expect(transactions[0].id).toBe('tx-1');
  });

  it('should record a verification', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    await act(async () => {
      await result.current.recordVerification(
        'ver-1',
        'prod-1',
        'quality',
        'passed',
        validUntil
      );
    });
    
    expect(mockContract.recordVerification).toHaveBeenCalledWith(
      'ver-1',
      'prod-1',
      'quality',
      'passed',
      validUntil
    );
  });

  it('should get product verifications', async () => {
    const { result } = renderHook(() => useBlockchain());
    
    await act(async () => {
      await result.current.connect();
    });
    
    let verifications;
    await act(async () => {
      verifications = await result.current.getProductVerifications('prod-1');
    });
    
    expect(mockContract.getProductVerifications).toHaveBeenCalledWith('prod-1');
    expect(verifications.length).toBe(1);
    expect(verifications[0].id).toBe('ver-1');
  });
});