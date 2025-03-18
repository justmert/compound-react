/**
 * Tests for useGetUtilization hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes and formats the data from the client
 * 4. We test the refetch functionality by changing mock return values
 */

import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useGetUtilization } from '../useGetUtilization';
import { CometClient } from '../../../api/CometClient';
import { wrapper, mockCompoundContext } from './testUtils';

// Mock the context
mockCompoundContext();

// Mock the static formatUnits method
CometClient.formatUnits = jest.fn().mockImplementation((value) => {
  if (value.toString() === '500000000000000000') {
    return '0.5';
  }
  if (value.toString() === '700000000000000000') {
    return '0.7';
  }
  return '0';
});

// Mock CometClient
const mockGetUtilization = jest.fn()
  .mockResolvedValue(BigNumber.from('500000000000000000')); // 0.5 * 1e18 (50% utilization)

const mockCometContract = {
  getUtilization: mockGetUtilization,
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

describe('useGetUtilization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUtilization.mockResolvedValue(BigNumber.from('500000000000000000'));
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should fetch utilization rate correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetUtilization(client), { wrapper });
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockGetUtilization).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.utilization).toEqual(BigNumber.from('500000000000000000'));
    expect(result.current.utilizationRate).toBe(50);
  });

  it('should refetch data when refetch is called', async () => {
    // Setup mock to return different values on subsequent calls
    mockGetUtilization
      .mockResolvedValueOnce(BigNumber.from('500000000000000000')) // First call: 50%
      .mockResolvedValueOnce(BigNumber.from('700000000000000000')); // Second call: 70%
    
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useGetUtilization(client), { wrapper });
    
    // Wait for the initial effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial data
    expect(result.current.utilizationRate).toBe(50);
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockGetUtilization).toHaveBeenCalledTimes(2);
    
    // Verify hook output after refetch
    expect(result.current.utilizationRate).toBe(70);
  });
}); 