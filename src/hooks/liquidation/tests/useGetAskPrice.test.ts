/**
 * Tests for useGetAskPrice hook
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
import { useGetAskPrice } from '../useGetAskPrice';
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
const mockQuoteCollateral = jest.fn()
  .mockResolvedValue(BigNumber.from('1000000000000000000')); // 1 ETH in wei

const mockCometContract = {
  quoteCollateral: mockQuoteCollateral,
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

describe('useGetAskPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuoteCollateral.mockResolvedValue(BigNumber.from('1000000000000000000'));
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch ask price correctly', async () => {
    const client = new CometClient({} as any, 1);
    const assetAddress = '0x1234567890123456789012345678901234567890';
    const baseAmount = BigNumber.from('1000000000000000000'); // 1 base token
    
    const { result } = renderHook(() => useGetAskPrice(assetAddress, baseAmount, client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockQuoteCollateral).toHaveBeenCalledWith(assetAddress, baseAmount);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.askPrice).toEqual(BigNumber.from('1000000000000000000'));
    expect(result.current.askPriceUSD).toBeTruthy();
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockQuoteCollateral
      .mockResolvedValueOnce(BigNumber.from('1000000000000000000')) // First call: 1 ETH
      .mockResolvedValueOnce(BigNumber.from('1500000000000000000')); // Second call: 1.5 ETH
    
    const client = new CometClient({} as any, 1);
    const assetAddress = '0x1234567890123456789012345678901234567890';
    const baseAmount = BigNumber.from('1000000000000000000'); // 1 base token
    
    const { result } = renderHook(() => useGetAskPrice(assetAddress, baseAmount, client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.askPrice).toEqual(BigNumber.from('1000000000000000000'));
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockQuoteCollateral).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.askPrice).toEqual(BigNumber.from('1500000000000000000'));
  });
}); 