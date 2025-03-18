/**
 * Tests for useAllow hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the transaction
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAllow } from '../useAllow';
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
const mockAllow = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
});

const mockCometContract = {
  allow: mockAllow,
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

describe('useAllow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should allow a manager correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAllow(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    
    const managerAddress = '0x1234567890123456789012345678901234567890';
    const isAllowed = true;
    
    // Call allow
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.allow(managerAddress, isAllowed);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockAllow).toHaveBeenCalledWith(managerAddress, isAllowed);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should disallow a manager correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAllow(client), { wrapper });
    
    const managerAddress = '0x1234567890123456789012345678901234567890';
    const isAllowed = false;
    
    // Call allow to disallow
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.allow(managerAddress, isAllowed);
    });
    
    // Verify client interaction
    expect(mockAllow).toHaveBeenCalledWith(managerAddress, isAllowed);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });
}); 