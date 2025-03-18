/**
 * Tests for useGetAssetInfoByAddress hook
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
import { useGetAssetInfoByAddress } from '../useGetAssetInfoByAddress';
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

// Mock asset info data
const mockAssetInfoData = {
  offset: 0,
  asset: '0xAssetAddress',
  priceFeed: '0xPriceFeedAddress',
  scale: BigNumber.from('1000000000000000000'),
  borrowCollateralFactor: BigNumber.from('650000000000000000'), // 65%
  liquidateCollateralFactor: BigNumber.from('850000000000000000'), // 85%
  liquidationFactor: BigNumber.from('930000000000000000'), // 93%
  supplyCap: BigNumber.from('10000000000000000000000') // 10,000 tokens
};

// Mock CometClient
const mockGetAssetInfoByAddress = jest.fn().mockResolvedValue(mockAssetInfoData);

const mockCometContract = {
  getAssetInfoByAddress: mockGetAssetInfoByAddress,
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

describe('useGetAssetInfoByAddress', () => {
  const assetAddress = '0xAssetAddress';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockGetAssetInfoByAddress.mockResolvedValue(mockAssetInfoData);
  });

  it('should fetch asset info by address correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetAssetInfoByAddress(client, assetAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.assetInfo).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockGetAssetInfoByAddress).toHaveBeenCalledWith(assetAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.assetInfo).toEqual(mockAssetInfoData);
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetAssetInfoByAddress(client, assetAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    const updatedAssetInfoData = {
      ...mockAssetInfoData,
      borrowCollateralFactor: BigNumber.from('700000000000000000'), // 70%
      supplyCap: BigNumber.from('20000000000000000000000') // 20,000 tokens
    };
    mockGetAssetInfoByAddress.mockResolvedValue(updatedAssetInfoData);
    
    // Call refetch
    let refetchResult: any = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockGetAssetInfoByAddress).toHaveBeenCalledTimes(2);
    expect(mockGetAssetInfoByAddress).toHaveBeenCalledWith(assetAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.assetInfo).toEqual(updatedAssetInfoData);
    expect(refetchResult).toEqual(updatedAssetInfoData);
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to fetch asset info by address');
    mockGetAssetInfoByAddress.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useGetAssetInfoByAddress(client, assetAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.assetInfo).toBeNull();
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useGetAssetInfoByAddress(null, assetAddress), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(result.current.assetInfo).toBeNull();
    
    // Verify client interaction
    expect(mockGetAssetInfoByAddress).not.toHaveBeenCalled();
  });

  it('should handle missing asset address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetAssetInfoByAddress(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Asset address not provided'));
    expect(result.current.assetInfo).toBeNull();
    
    // Verify client interaction
    expect(mockGetAssetInfoByAddress).not.toHaveBeenCalled();
  });
}); 