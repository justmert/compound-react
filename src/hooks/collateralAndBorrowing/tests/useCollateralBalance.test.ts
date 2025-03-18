/**
 * Tests for useCollateralBalance hook
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
import { useCollateralBalance } from '../useCollateralBalance';
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
const mockCollateralBalanceOf = jest.fn().mockResolvedValue(BigNumber.from('1000000000000000000')); // 1 token with 18 decimals

const mockCometContract = {
  collateralBalanceOf: mockCollateralBalanceOf,
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

describe('useCollateralBalance', () => {
  const accountAddress = '0x1234567890123456789012345678901234567890';
  const assetAddress = '0x2345678901234567890123456789012345678901';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockCollateralBalanceOf.mockResolvedValue(BigNumber.from('1000000000000000000'));
  });

  it('should fetch collateral balance correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useCollateralBalance(client, accountAddress, assetAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.balance).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockCollateralBalanceOf).toHaveBeenCalledWith(accountAddress, assetAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.balance).toEqual(BigNumber.from('1000000000000000000'));
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useCollateralBalance(client, accountAddress, assetAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockCollateralBalanceOf.mockResolvedValue(BigNumber.from('2000000000000000000'));
    
    // Call refetch
    let refetchResult: BigNumber | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockCollateralBalanceOf).toHaveBeenCalledTimes(2);
    expect(mockCollateralBalanceOf).toHaveBeenCalledWith(accountAddress, assetAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.balance).toEqual(BigNumber.from('2000000000000000000'));
    expect(refetchResult).toEqual(BigNumber.from('2000000000000000000'));
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch collateral balance');
    mockCollateralBalanceOf.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useCollateralBalance(client, accountAddress, assetAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.balance).toBeNull();
  });

  it('should handle missing account address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useCollateralBalance(client, null, assetAddress), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Account address not provided'));
    expect(result.current.balance).toBeNull();
    
    // Verify client interaction
    expect(mockCollateralBalanceOf).not.toHaveBeenCalled();
  });

  it('should handle missing asset address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useCollateralBalance(client, accountAddress, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Asset address not provided'));
    expect(result.current.balance).toBeNull();
    
    // Verify client interaction
    expect(mockCollateralBalanceOf).not.toHaveBeenCalled();
  });
}); 