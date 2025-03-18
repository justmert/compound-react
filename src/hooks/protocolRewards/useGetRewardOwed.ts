import { useState, useEffect, useCallback } from 'react';
import { BigNumber, Contract } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

// ABI for the getRewardOwed function in the CometRewards contract
const REWARDS_ABI = [
  'function getRewardOwed(address comet, address account) view returns (address, uint256)'
];

export interface RewardOwed {
  token: string;
  owed: BigNumber;
}

export interface UseGetRewardOwedResult {
  reward: RewardOwed | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<RewardOwed | null>;
}

/**
 * Hook to get the amount of reward token accrued but not yet claimed
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @param rewardsAddress The address of the CometRewards contract
 * @returns The reward token and amount owed, loading state, error, and refetch function
 */
export function useGetRewardOwed(
  client: CometClient | null,
  accountAddress: string | null,
  rewardsAddress: string | null
): UseGetRewardOwedResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [reward, setReward] = useState<RewardOwed | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewardOwed = useCallback(async (): Promise<RewardOwed | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!accountAddress) {
      setError(new Error('Account address not provided'));
      return null;
    }

    if (!rewardsAddress) {
      setError(new Error('Rewards contract address not provided'));
      return null;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the Comet contract address
      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const cometAddress = comet.address;
      
      // Create a contract instance for the CometRewards contract
      const provider = activeClient.getProvider();
      const rewardsContract = new Contract(rewardsAddress, REWARDS_ABI, provider);
      
      // Call getRewardOwed
      const [tokenAddress, amountOwed] = await rewardsContract.getRewardOwed(cometAddress, accountAddress);
      
      const rewardOwed: RewardOwed = {
        token: tokenAddress,
        owed: amountOwed
      };
      
      setReward(rewardOwed);
      return rewardOwed;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress, rewardsAddress]);

  useEffect(() => {
    fetchRewardOwed();
  }, [fetchRewardOwed]);

  return {
    reward,
    loading,
    error,
    refetch: fetchRewardOwed
  };
} 