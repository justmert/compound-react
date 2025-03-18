/**
 * Tests for useAbsorb hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the transaction
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAbsorb } from '../useAbsorb';
import { CometClient } from '../../../api/CometClient';

// Mock the context
jest.mock('../../../context/CompoundContext', () => ({
  useCompoundContext: jest.fn().mockReturnValue({
    client: null,
    network: 1,
    isInitialized: true,
    error: null
  }),
}));

// Mock CometClient
const mockAbsorb = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
});

const mockCometContract = {
  absorb: mockAbsorb,
};

const mockClient = {
  isInitialized: jest.fn().mockReturnValue(true),
  getComet: jest.fn().mockReturnValue(mockCometContract),
};

// Mock the CometClient constructor
jest.mock('../../../api/CometClient', () => {
  const originalModule = jest.requireActual('../../../api/CometClient');
  
  return {
    ...originalModule,
    CometClient: jest.fn().mockImplementation(() => mockClient),
  };
});

// Simple wrapper for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => children;

describe('useAbsorb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should absorb accounts correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAbsorb(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    
    const absorberAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
    const accountsToAbsorb = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321'
    ];
    
    // Call absorb
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.absorb(absorberAddress, accountsToAbsorb);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockAbsorb).toHaveBeenCalledWith(absorberAddress, accountsToAbsorb);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });
}); 