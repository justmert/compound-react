import { renderHook, act, waitFor } from '@testing-library/react';
import { useClaimReward } from '../useClaimReward';

// Mock getSigner and Contract
const mockClaim = jest.fn();
const mockWait = jest.fn().mockResolvedValue({
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
});
const mockTx = { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', wait: mockWait };
mockClaim.mockResolvedValue(mockTx);

const mockContract = {
  claim: mockClaim
};

// Mock getSigner
const mockGetSigner = jest.fn().mockReturnValue({});

// Mock provider with getSigner
const mockProvider = {
  getSigner: mockGetSigner
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
  getProvider: jest.fn().mockReturnValue(mockProvider)
};

describe('useClaimReward', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should claim rewards correctly', async () => {
    const { result } = renderHook(() => 
      useClaimReward(
        mockCometClient as any, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.txHash).toBe(null);

    // Call claimReward
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.claimReward(true);
    });

    // Verify client interaction
    expect(mockCometClient.isInitialized).toHaveBeenCalled();
    expect(mockCometClient.getComet).toHaveBeenCalled();
    expect(mockCometClient.getProvider).toHaveBeenCalled();
    expect(mockGetSigner).toHaveBeenCalled();
    expect(mockClaim).toHaveBeenCalledWith('0xCometAddress', '0xUserAddress', true);
    expect(mockWait).toHaveBeenCalled();

    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.txHash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(txHash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  });

  it('should handle errors correctly', async () => {
    // Mock an error
    mockClaim.mockRejectedValueOnce(new Error('Failed to claim reward'));

    const { result } = renderHook(() => 
      useClaimReward(
        mockCometClient as any, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Call claimReward
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.claimReward(true);
    });

    // Verify error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to claim reward');
    expect(result.current.txHash).toBe(null);
    expect(txHash).toBe(null);
  });

  it('should handle missing account address', async () => {
    const { result } = renderHook(() => 
      useClaimReward(
        mockCometClient as any, 
        null, 
        '0xRewardsContractAddress'
      )
    );

    // Call claimReward
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.claimReward(true);
    });

    // Verify error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Account address not provided');
    expect(result.current.txHash).toBe(null);
    expect(txHash).toBe(null);
  });

  it('should handle missing rewards address', async () => {
    const { result } = renderHook(() => 
      useClaimReward(
        mockCometClient as any, 
        '0xUserAddress', 
        null
      )
    );

    // Call claimReward
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.claimReward(true);
    });

    // Verify error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Rewards contract address not provided');
    expect(result.current.txHash).toBe(null);
    expect(txHash).toBe(null);
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => 
      useClaimReward(
        null, 
        '0xUserAddress', 
        '0xRewardsContractAddress'
      )
    );

    // Call claimReward
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.claimReward(true);
    });

    // Verify error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Client not provided');
    expect(result.current.txHash).toBe(null);
    expect(txHash).toBe(null);
  });
}); 