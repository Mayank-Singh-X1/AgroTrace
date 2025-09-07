// jest.setup.js
// This file runs after the testing framework is installed in the environment but before the test code itself.

// For React Testing Library
import '@testing-library/jest-dom';

// Mock global objects that might not be available in the test environment
global.fetch = jest.fn();

// Mock window.ethereum for blockchain tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ethereum', {
    value: {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    },
    writable: true,
  });
}