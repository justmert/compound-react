import { renderHook, act, waitFor } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useGetRewardOwed } from '../useGetRewardOwed';

// Mock CometClient
const mockGetRewardOwed = jest.fn();
const mockContract = {
  getRewardOwed: mockGetRewardOwed
};

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    Contract: jest.fn().mockImplementation(() => mockContract)
  };
});

const mockComet = {
  address: '0xCometAddress'
};

const mockCometClient = {
  isInitialized: jest.fn().mockReturnValue(true),
  getComet: jest.fn().mockReturnValue(mockComet),
  getProvider: jest.fn().mockReturnValue({})
};

describe('useGetRewardOwed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRewardOwed.mockResolvedValue(['0xRewardTokenAddress', BigNumber.from('1000000000000000000')]);
  });

  it('should fetch reward owed correctly', async () => {
    const { result } = renderHook(() => 
      useGetRewardOwed(
        mockCometClient as any, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.reward).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the result
    expect(result.current.error).toBe(null);
    expect(result.current.reward).toEqual({
      token: '0xRewardTokenAddress',
      owed: BigNumber.from('1000000000000000000')
    });

    // Verify the correct parameters were passed
    expect(mockGetRewardOwed).toHaveBeenCalledWith('0xCometAddress', '0xUserAddress');
  });

  it('should handle refetch correctly', async () => {
    const { result } = renderHook(() => 
      useGetRewardOwed(
        mockCometClient as any, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update the mock to return a different value
    mockGetRewardOwed.mockResolvedValue(['0xRewardTokenAddress', BigNumber.from('2000000000000000000')]);

    // Trigger refetch
    act(() => {
      result.current.refetch();
    });

    // Should be loading again
    expect(result.current.loading).toBe(true);

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify updated result
    expect(result.current.reward).toEqual({
      token: '0xRewardTokenAddress',
      owed: BigNumber.from('2000000000000000000')
    });
  });

  it('should handle errors correctly', async () => {
    // Mock an error
    mockGetRewardOwed.mockRejectedValue(new Error('Failed to fetch reward'));

    const { result } = renderHook(() => 
      useGetRewardOwed(
        mockCometClient as any, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch reward');
    expect(result.current.reward).toBe(null);
  });

  it('should handle missing account address', async () => {
    const { result } = renderHook(() => 
      useGetRewardOwed(
        mockCometClient as any, 
        null, 
        '0xRewardsContractAddress'
      )
    );

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Account address not provided');
    expect(result.current.reward).toBe(null);
  });

  it('should handle missing rewards address', async () => {
    const { result } = renderHook(() => 
      useGetRewardOwed(
        mockCometClient as any, 
        '0xUserAddress', 
        null
      )
    );

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Rewards contract address not provided');
    expect(result.current.reward).toBe(null);
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => 
      useGetRewardOwed(
        null, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Client not provided');
    expect(result.current.reward).toBe(null);
  });
}); 