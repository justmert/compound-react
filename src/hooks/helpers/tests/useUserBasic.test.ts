/**
 * Tests for useUserBasic hook
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
import { useUserBasic } from '../useUserBasic';
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
const mockUserBasic = jest.fn().mockResolvedValue([
  BigNumber.from('100000000000000000000'), // principal: 100 tokens with 18 decimals
  BigNumber.from('1000000000000000000'), // baseTrackingIndex
  BigNumber.from('500000000000000000'), // baseTrackingAccrued
  BigNumber.from('3') // assetsIn: 3 assets
]);

const mockCometContract = {
  userBasic: mockUserBasic,
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

describe('useUserBasic', () => {
  const accountAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockUserBasic.mockResolvedValue([
      BigNumber.from('100000000000000000000'),
      BigNumber.from('1000000000000000000'),
      BigNumber.from('500000000000000000'),
      BigNumber.from('3')
    ]);
  });

  it('should fetch user basic data correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserBasic(client, accountAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.userBasic).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockUserBasic).toHaveBeenCalledWith(accountAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.userBasic).toEqual({
      principal: BigNumber.from('100000000000000000000'),
      baseTrackingIndex: BigNumber.from('1000000000000000000'),
      baseTrackingAccrued: BigNumber.from('500000000000000000'),
      assetsIn: BigNumber.from('3')
    });
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserBasic(client, accountAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockUserBasic.mockResolvedValue([
      BigNumber.from('200000000000000000000'),
      BigNumber.from('1500000000000000000'),
      BigNumber.from('700000000000000000'),
      BigNumber.from('4')
    ]);
    
    // Call refetch
    let refetchResult: any = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockUserBasic).toHaveBeenCalledTimes(2);
    expect(mockUserBasic).toHaveBeenCalledWith(accountAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.userBasic).toEqual({
      principal: BigNumber.from('200000000000000000000'),
      baseTrackingIndex: BigNumber.from('1500000000000000000'),
      baseTrackingAccrued: BigNumber.from('700000000000000000'),
      assetsIn: BigNumber.from('4')
    });
    expect(refetchResult).toEqual({
      principal: BigNumber.from('200000000000000000000'),
      baseTrackingIndex: BigNumber.from('1500000000000000000'),
      baseTrackingAccrued: BigNumber.from('700000000000000000'),
      assetsIn: BigNumber.from('4')
    });
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch user basic data');
    mockUserBasic.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useUserBasic(client, accountAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.userBasic).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useUserBasic(null, accountAddress), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.userBasic).toBeNull();
    
    // Verify client interaction
    expect(mockUserBasic).not.toHaveBeenCalled();
  });

  it('should handle missing account address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useUserBasic(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Account address not provided'));
    expect(result.current.userBasic).toBeNull();
    
    // Verify client interaction
    expect(mockUserBasic).not.toHaveBeenCalled();
  });
}); 