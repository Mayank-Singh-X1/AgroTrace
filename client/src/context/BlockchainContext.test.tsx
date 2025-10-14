import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BlockchainProvider, useBlockchain } from './BlockchainContext';
import { blockchain } from '../lib/blockchain';

// Mock the blockchain module
jest.mock('../lib/blockchain', () => ({
  blockchain: {
    getStats: jest.fn().mockReturnValue({
      totalBlocks: 1,
      totalTransactions: 0,
      totalProducts: 0,
      pendingTransactions: 0,
      isValid: true
    }),
    getAllProducts: jest.fn().mockReturnValue([]),
    getProduct: jest.fn().mockReturnValue(undefined),
    addTransaction: jest.fn(),
    minePendingTransactions: jest.fn().mockReturnValue(null)
  },
  generateTransactionId: jest.fn().mockReturnValue('tx-123'),
  generateProductId: jest.fn().mockReturnValue('AGR-2024-001')
}));

// Test component that uses the blockchain context
const TestComponent = () => {
  const { isConnected, stats, createProduct } = useBlockchain();
  return (
    <div>
      <div data-testid="connection-status">{isConnected ? 'Connected' : 'Disconnected'}</div>
      <div data-testid="total-blocks">{stats.totalBlocks}</div>
      <div data-testid="total-products">{stats.totalProducts}</div>
      <button data-testid="create-product-btn" onClick={() => createProduct({ name: 'Test Product' })}>Create Product</button>
    </div>
  );
};

describe('BlockchainContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide blockchain context with initial connected state', () => {
    render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    expect(screen.getByTestId('total-blocks')).toHaveTextContent('1');
    expect(screen.getByTestId('total-products')).toHaveTextContent('0');
  });

  it('should display blockchain statistics', () => {
    render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );
    
    expect(screen.getByTestId('total-blocks')).toHaveTextContent('1'); // Genesis block
    expect(screen.getByTestId('total-products')).toHaveTextContent('0');
  });
});
