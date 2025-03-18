/**
 * Tests for useGetSupplyRate hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We mock the useGetUtilization hook to isolate the supply rate functionality
 * 3. We directly test the hook's interaction with the client
 * 4. We verify the hook correctly processes and formats the data from the client
 * 5. We test custom utilization parameter functionality
 * 6. We test the refetch functionality by changing mock return values
 */

import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useGetSupplyRate } from '../useGetSupplyRate';
import { CometClient } from '../../../api/CometClient';
import * as utilizationHook from '../useGetUtilization';
import { wrapper, mockCompoundContext } from './testUtils';

// Mock the context
mockCompoundContext();

// Mock the static formatUnits method
CometClient.formatUnits = jest.fn().mockImplementation((value) => {
  if (value.toString() === '20000000000000000') {
    return '0.00000000063419583'; // Approximately 2% APR when multiplied by seconds per year
  }
  if (value.toString() === '30000000000000000') {
    return '0.00000000095129375'; // Approximately 3% APR when multiplied by seconds per year
  }
  if (value.toString() === '500000000000000000') {
    return '0.5';
  }
  if (value.toString() === '800000000000000000') {
    return '0.8';
  }
  return '0';
});

// Mock CometClient
const mockGetSupplyRate = jest.fn()
  .mockResolvedValue(BigNumber.from('20000000000000000')); // 0.02 * 1e18 (2% supply rate)

const mockCometContract = {
  getSupplyRate: mockGetSupplyRate,
  getUtilization: jest.fn().mockResolvedValue(BigNumber.from('500000000000000000')), // 0.5 * 1e18 (50% utilization)
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

// Mock the useGetUtilization hook
jest.mock('../useGetUtilization', () => {
  return {
    useGetUtilization: jest.fn().mockReturnValue({
      utilization: BigNumber.from('500000000000000000'), // 0.5 * 1e18 (50% utilization)
      utilizationRate: 50,
      loading: false,
      error: null,
      refetch: jest.fn(),
    }),
  };
});

describe('useGetSupplyRate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupplyRate.mockResolvedValue(BigNumber.from('20000000000000000'));
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch supply rate correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetSupplyRate(client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockGetSupplyRate).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.supplyRate).toEqual(BigNumber.from('20000000000000000'));
    expect(result.current.supplyRateAPR).toBeCloseTo(2, 0);
    expect(result.current.supplyRateAPY).toBeCloseTo(2.02, 0);
  });

  it('should use custom utilization if provided', async () => {
    const customUtilization = BigNumber.from('800000000000000000'); // 0.8 * 1e18 (80% utilization)
    
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetSupplyRate(client, customUtilization), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction with custom utilization
    expect(mockGetSupplyRate).toHaveBeenCalledWith(customUtilization);
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockGetSupplyRate
      .mockResolvedValueOnce(BigNumber.from('20000000000000000')) // First call: 2%
      .mockResolvedValueOnce(BigNumber.from('30000000000000000')); // Second call: 3%
    
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetSupplyRate(client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.supplyRateAPR).toBeCloseTo(2, 0);
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockGetSupplyRate).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.supplyRateAPR).toBeCloseTo(3, 0);
  });
}); 