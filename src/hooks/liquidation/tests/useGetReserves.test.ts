/**
 * Tests for useGetReserves hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes and formats the data from the client
 * 4. We test the refetch functionality
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useGetReserves } from '../useGetReserves';
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
const mockGetReserves = jest.fn()
  .mockResolvedValue(BigNumber.from('10000000000000000000000')); // 10,000 tokens

const mockCometContract = {
  getReserves: mockGetReserves,
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

describe('useGetReserves', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReserves.mockResolvedValue(BigNumber.from('10000000000000000000000'));
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch reserves correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetReserves(client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockGetReserves).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.reserves).toEqual(BigNumber.from('10000000000000000000000'));
    expect(result.current.reservesUSD).toBeTruthy();
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockGetReserves
      .mockResolvedValueOnce(BigNumber.from('10000000000000000000000')) // First call: 10,000 tokens
      .mockResolvedValueOnce(BigNumber.from('15000000000000000000000')); // Second call: 15,000 tokens
    
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetReserves(client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.reserves).toEqual(BigNumber.from('10000000000000000000000'));
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockGetReserves).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.reserves).toEqual(BigNumber.from('15000000000000000000000'));
  });
}); 