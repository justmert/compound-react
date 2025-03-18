/**
 * Tests for useGetTargetReserves hook
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
import { useGetTargetReserves } from '../useGetTargetReserves';
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
const mockTargetReserves = jest.fn()
  .mockResolvedValue(BigNumber.from('20000000000000000000000')); // 20,000 tokens

const mockCometContract = {
  targetReserves: mockTargetReserves,
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

describe('useGetTargetReserves', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTargetReserves.mockResolvedValue(BigNumber.from('20000000000000000000000'));
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch target reserves correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetTargetReserves(client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockTargetReserves).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.targetReserves).toEqual(BigNumber.from('20000000000000000000000'));
    expect(result.current.targetReservesUSD).toBeTruthy();
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockTargetReserves
      .mockResolvedValueOnce(BigNumber.from('20000000000000000000000')) // First call: 20,000 tokens
      .mockResolvedValueOnce(BigNumber.from('25000000000000000000000')); // Second call: 25,000 tokens
    
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetTargetReserves(client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.targetReserves).toEqual(BigNumber.from('20000000000000000000000'));
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockTargetReserves).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.targetReserves).toEqual(BigNumber.from('25000000000000000000000'));
  });
}); 