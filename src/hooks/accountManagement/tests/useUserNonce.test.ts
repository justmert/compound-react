/**
 * Tests for useUserNonce hook
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
import { useUserNonce } from '../useUserNonce';
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
const mockUserNonce = jest.fn().mockResolvedValue(BigNumber.from(5));

const mockCometContract = {
  userNonce: mockUserNonce,
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

describe('useUserNonce', () => {
  const userAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockUserNonce.mockResolvedValue(BigNumber.from(5));
  });

  it('should fetch user nonce correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserNonce(client, userAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.nonce).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockUserNonce).toHaveBeenCalledWith(userAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.nonce).toEqual(BigNumber.from(5));
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserNonce(client, userAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockUserNonce.mockResolvedValue(BigNumber.from(10));
    
    // Call refetch
    let refetchResult: BigNumber | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockUserNonce).toHaveBeenCalledTimes(2);
    expect(mockUserNonce).toHaveBeenCalledWith(userAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.nonce).toEqual(BigNumber.from(10));
    expect(refetchResult).toEqual(BigNumber.from(10));
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch nonce');
    mockUserNonce.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useUserNonce(client, userAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.nonce).toBeNull();
  });

  it('should handle missing user address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserNonce(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('User address not provided'));
    expect(result.current.nonce).toBeNull();
    
    // Verify client interaction
    expect(mockUserNonce).not.toHaveBeenCalled();
  });
}); 