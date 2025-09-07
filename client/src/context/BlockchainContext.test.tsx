import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BlockchainProvider, useBlockchainContext } from './BlockchainContext';
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

// Test component that uses the blockchain context
const TestComponent = () => {
  const { connected, account, connect, disconnect } = useBlockchainContext();
  return (
    <div>
      <div data-testid="connection-status">{connected ? 'Connected' : 'Disconnected'}</div>
      <div data-testid="account">{account}</div>
      <button data-testid="connect-btn" onClick={connect}>Connect</button>
      <button data-testid="disconnect-btn" onClick={disconnect}>Disconnect</button>
    </div>
  );
};

describe('BlockchainContext', () => {
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
      })
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

  it('should provide blockchain context with initial disconnected state', () => {
    render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('account')).toHaveTextContent('');
  });

  it('should connect to blockchain when connect is called', async () => {
    render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );
    
    await act(async () => {
      screen.getByTestId('connect-btn').click();
    });
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    expect(screen.getByTestId('account')).toHaveTextContent('0x1234567890123456789012345678901234567890');
    expect(mockWindow.ethereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
  });

  it('should disconnect from blockchain when disconnect is called', async () => {
    render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );
    
    // First connect
    await act(async () => {
      screen.getByTestId('connect-btn').click();
    });
    
    // Then disconnect
    await act(async () => {
      screen.getByTestId('disconnect-btn').click();
    });
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('account')).toHaveTextContent('');
  });
});