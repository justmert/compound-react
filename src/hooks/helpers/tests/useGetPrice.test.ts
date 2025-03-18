/**
 * Tests for useGetPrice hook
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
import { useGetPrice } from '../useGetPrice';
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
const mockGetPrice = jest.fn().mockResolvedValue(BigNumber.from('500000000')); // $5.00 with 8 decimals

const mockCometContract = {
  getPrice: mockGetPrice,
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

describe('useGetPrice', () => {
  const priceFeed = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockGetPrice.mockResolvedValue(BigNumber.from('500000000')); // $5.00 with 8 decimals
  });

  it('should fetch price correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetPrice(client, priceFeed), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.price).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockGetPrice).toHaveBeenCalledWith(priceFeed);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.price).toEqual(BigNumber.from('500000000'));
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetPrice(client, priceFeed), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockGetPrice.mockResolvedValue(BigNumber.from('600000000')); // $6.00 with 8 decimals
    
    // Call refetch
    let refetchResult: BigNumber | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockGetPrice).toHaveBeenCalledTimes(2);
    expect(mockGetPrice).toHaveBeenCalledWith(priceFeed);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.price).toEqual(BigNumber.from('600000000'));
    expect(refetchResult).toEqual(BigNumber.from('600000000'));
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch price');
    mockGetPrice.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useGetPrice(client, priceFeed), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.price).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useGetPrice(null, priceFeed), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.price).toBeNull();
    
    // Verify client interaction
    expect(mockGetPrice).not.toHaveBeenCalled();
  });

  it('should handle missing price feed address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetPrice(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Price feed address not provided'));
    expect(result.current.price).toBeNull();
    
    // Verify client interaction
    expect(mockGetPrice).not.toHaveBeenCalled();
  });
}); 