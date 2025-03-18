/**
 * Tests for useGetBaseAccrualScale hook
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
import { useGetBaseAccrualScale } from '../useGetBaseAccrualScale';
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
const mockBaseAccrualScale = jest.fn().mockResolvedValue(BigNumber.from('1000000000000000000')); // 1e18

const mockCometContract = {
  baseAccrualScale: mockBaseAccrualScale,
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

describe('useGetBaseAccrualScale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockBaseAccrualScale.mockResolvedValue(BigNumber.from('1000000000000000000'));
  });

  it('should fetch base accrual scale correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetBaseAccrualScale(client), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.baseAccrualScale).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockBaseAccrualScale).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.baseAccrualScale).toEqual(BigNumber.from('1000000000000000000'));
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetBaseAccrualScale(client), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockBaseAccrualScale.mockResolvedValue(BigNumber.from('2000000000000000000'));
    
    // Call refetch
    let refetchResult: BigNumber | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockBaseAccrualScale).toHaveBeenCalledTimes(2);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.baseAccrualScale).toEqual(BigNumber.from('2000000000000000000'));
    expect(refetchResult).toEqual(BigNumber.from('2000000000000000000'));
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch base accrual scale');
    mockBaseAccrualScale.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useGetBaseAccrualScale(client), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.baseAccrualScale).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useGetBaseAccrualScale(null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.baseAccrualScale).toBeNull();
    
    // Verify client interaction
    expect(mockBaseAccrualScale).not.toHaveBeenCalled();
  });
}); 