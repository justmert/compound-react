/**
 * Tests for useTotalCollateral hook
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
import { useTotalCollateral } from '../useTotalCollateral';
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
const mockTotalsCollateral = jest.fn().mockResolvedValue([
  BigNumber.from('300000000000000000000'), // totalSupplyAsset: 300 tokens with 18 decimals
  BigNumber.from('0') // reserved
]);

const mockCometContract = {
  totalsCollateral: mockTotalsCollateral,
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

describe('useTotalCollateral', () => {
  const assetAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockTotalsCollateral.mockResolvedValue([
      BigNumber.from('300000000000000000000'),
      BigNumber.from('0')
    ]);
  });

  it('should fetch total collateral correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTotalCollateral(client, assetAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.totalsCollateral).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockTotalsCollateral).toHaveBeenCalledWith(assetAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.totalsCollateral).toEqual({
      totalSupplyAsset: BigNumber.from('300000000000000000000'),
      reserved: BigNumber.from('0')
    });
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTotalCollateral(client, assetAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockTotalsCollateral.mockResolvedValue([
      BigNumber.from('400000000000000000000'),
      BigNumber.from('0')
    ]);
    
    // Call refetch
    let refetchResult: any = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockTotalsCollateral).toHaveBeenCalledTimes(2);
    expect(mockTotalsCollateral).toHaveBeenCalledWith(assetAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalsCollateral).toEqual({
      totalSupplyAsset: BigNumber.from('400000000000000000000'),
      reserved: BigNumber.from('0')
    });
    expect(refetchResult).toEqual({
      totalSupplyAsset: BigNumber.from('400000000000000000000'),
      reserved: BigNumber.from('0')
    });
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch total collateral');
    mockTotalsCollateral.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useTotalCollateral(client, assetAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.totalsCollateral).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useTotalCollateral(null, assetAddress), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.totalsCollateral).toBeNull();
    
    // Verify client interaction
    expect(mockTotalsCollateral).not.toHaveBeenCalled();
  });

  it('should handle missing asset address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTotalCollateral(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Asset address not provided'));
    expect(result.current.totalsCollateral).toBeNull();
    
    // Verify client interaction
    expect(mockTotalsCollateral).not.toHaveBeenCalled();
  });
}); 