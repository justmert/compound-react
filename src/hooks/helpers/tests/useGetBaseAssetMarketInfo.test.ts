/**
 * Tests for useGetBaseAssetMarketInfo hook
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
import { useGetBaseAssetMarketInfo } from '../useGetBaseAssetMarketInfo';
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

// Mock market info data
const mockMarketInfoData = {
  baseSupplyIndex: BigNumber.from('1000000000000000000'),
  baseBorrowIndex: BigNumber.from('1100000000000000000'),
  trackingSupplyIndex: BigNumber.from('1200000000000000000'),
  trackingBorrowIndex: BigNumber.from('1300000000000000000'),
  totalSupplyBase: BigNumber.from('5000000000000000000000'),
  totalBorrowBase: BigNumber.from('3000000000000000000000'),
  lastAccrualTime: BigNumber.from('1620000000'),
  pauseFlags: 0
};

// Mock CometClient
const mockTotalsBasic = jest.fn().mockResolvedValue(mockMarketInfoData);

const mockCometContract = {
  totalsBasic: mockTotalsBasic,
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

describe('useGetBaseAssetMarketInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockTotalsBasic.mockResolvedValue(mockMarketInfoData);
  });

  it('should fetch market info correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetBaseAssetMarketInfo(client), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.marketInfo).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockTotalsBasic).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.marketInfo).toEqual(mockMarketInfoData);
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetBaseAssetMarketInfo(client), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    const updatedMarketInfoData = {
      ...mockMarketInfoData,
      totalSupplyBase: BigNumber.from('6000000000000000000000'),
      totalBorrowBase: BigNumber.from('4000000000000000000000'),
      lastAccrualTime: BigNumber.from('1630000000')
    };
    mockTotalsBasic.mockResolvedValue(updatedMarketInfoData);
    
    // Call refetch
    let refetchResult: any = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockTotalsBasic).toHaveBeenCalledTimes(2);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.marketInfo).toEqual(updatedMarketInfoData);
    expect(refetchResult).toEqual(updatedMarketInfoData);
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch market info');
    mockTotalsBasic.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useGetBaseAssetMarketInfo(client), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.marketInfo).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useGetBaseAssetMarketInfo(null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.marketInfo).toBeNull();
    
    // Verify client interaction
    expect(mockTotalsBasic).not.toHaveBeenCalled();
  });
}); 