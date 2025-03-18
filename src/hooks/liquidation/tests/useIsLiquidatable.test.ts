/**
 * Tests for useIsLiquidatable hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes and formats the data from the client
 * 4. We test the refetch functionality
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useIsLiquidatable } from '../useIsLiquidatable';
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
const mockIsLiquidatable = jest.fn().mockResolvedValue(true);

const mockCometContract = {
  isLiquidatable: mockIsLiquidatable,
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

describe('useIsLiquidatable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLiquidatable.mockResolvedValue(true);
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should check if account is liquidatable correctly', async () => {
    const client = new CometClient({} as any, 1);
    const account = '0x1234567890123456789012345678901234567890';
    
    const { result } = renderHook(() => useIsLiquidatable(account, client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockIsLiquidatable).toHaveBeenCalledWith(account);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLiquidatable).toBe(true);
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockIsLiquidatable
      .mockResolvedValueOnce(true)  // First call: account is liquidatable
      .mockResolvedValueOnce(false); // Second call: account is not liquidatable
    
    const client = new CometClient({} as any, 1);
    const account = '0x1234567890123456789012345678901234567890';
    
    const { result } = renderHook(() => useIsLiquidatable(account, client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.isLiquidatable).toBe(true);
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockIsLiquidatable).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.isLiquidatable).toBe(false);
  });
}); 