/**
 * Tests for useGetLiquidatorPoints hook
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
import { useGetLiquidatorPoints, LiquidatorPoints } from '../useGetLiquidatorPoints';
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
const mockLiquidatorPoints = jest.fn().mockResolvedValue([
  5, // numAbsorbs
  10, // numAbsorbed
  BigNumber.from('1000000000000000000') // approxSpend: 1 ETH in wei
]);

const mockCometContract = {
  liquidatorPoints: mockLiquidatorPoints,
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

describe('useGetLiquidatorPoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLiquidatorPoints.mockResolvedValue([
      5, // numAbsorbs
      10, // numAbsorbed
      BigNumber.from('1000000000000000000') // approxSpend: 1 ETH in wei
    ]);
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch liquidator points correctly', async () => {
    const client = new CometClient({} as any, 1);
    const address = '0x1234567890123456789012345678901234567890';
    
    const { result } = renderHook(() => useGetLiquidatorPoints(address, client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockLiquidatorPoints).toHaveBeenCalledWith(address);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.points).toEqual({
      numAbsorbs: 5,
      numAbsorbed: 10,
      approxSpend: BigNumber.from('1000000000000000000')
    });
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockLiquidatorPoints
      .mockResolvedValueOnce([
        5, // numAbsorbs
        10, // numAbsorbed
        BigNumber.from('1000000000000000000') // approxSpend: 1 ETH in wei
      ])
      .mockResolvedValueOnce([
        8, // numAbsorbs
        15, // numAbsorbed
        BigNumber.from('2000000000000000000') // approxSpend: 2 ETH in wei
      ]);
    
    const client = new CometClient({} as any, 1);
    const address = '0x1234567890123456789012345678901234567890';
    
    const { result } = renderHook(() => useGetLiquidatorPoints(address, client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.points).toEqual({
      numAbsorbs: 5,
      numAbsorbed: 10,
      approxSpend: BigNumber.from('1000000000000000000')
    });
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockLiquidatorPoints).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.points).toEqual({
      numAbsorbs: 8,
      numAbsorbed: 15,
      approxSpend: BigNumber.from('2000000000000000000')
    });
  });
}); 