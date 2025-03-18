/**
 * Tests for useTotalBorrow hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the data
 * 4. We test the refetch functionality
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useTotalBorrow } from '../useTotalBorrow';
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
const mockTotalBorrow = jest.fn().mockResolvedValue(BigNumber.from('500000000000000000000')); // 500 tokens with 18 decimals

const mockCometContract = {
  totalBorrow: mockTotalBorrow,
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

describe('useTotalBorrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockTotalBorrow.mockResolvedValue(BigNumber.from('500000000000000000000'));
  });

  it('should fetch total borrow correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTotalBorrow(client), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.totalBorrow).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockTotalBorrow).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.totalBorrow).toEqual(BigNumber.from('500000000000000000000'));
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTotalBorrow(client), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockTotalBorrow.mockResolvedValue(BigNumber.from('600000000000000000000'));
    
    // Call refetch
    let refetchResult: BigNumber | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockTotalBorrow).toHaveBeenCalledTimes(2);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalBorrow).toEqual(BigNumber.from('600000000000000000000'));
    expect(refetchResult).toEqual(BigNumber.from('600000000000000000000'));
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch total borrow');
    mockTotalBorrow.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useTotalBorrow(client), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.totalBorrow).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useTotalBorrow(null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.totalBorrow).toBeNull();
    
    // Verify client interaction
    expect(mockTotalBorrow).not.toHaveBeenCalled();
  });
}); 