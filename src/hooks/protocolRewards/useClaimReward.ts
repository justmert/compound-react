import { useState, useCallback } from 'react';
import { Contract, providers } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

// ABI for the claim function in the CometRewards contract
const REWARDS_ABI = [
  'function claim(address comet, address src, bool shouldAccrue) returns (uint256)'
];

export interface UseClaimRewardResult {
  claimReward: (shouldAccrue: boolean) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to claim accrued rewards
 * @param client The CometClient instance
 * @param accountAddress The address of the account to claim rewards for
 * @param rewardsAddress The address of the CometRewards contract
 * @returns The claim function, loading state, error, and transaction hash
 */
export function useClaimReward(
  client: CometClient | null,
  accountAddress: string | null,
  rewardsAddress: string | null
): UseClaimRewardResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const claimReward = useCallback(async (shouldAccrue: boolean = true): Promise<string | null> => {
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
      setTxHash(null);

      // Get the Comet contract address
      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const cometAddress = comet.address;
      
      // Create a contract instance for the CometRewards contract with a signer
      const provider = activeClient.getProvider();
      
      // Check if provider supports getSigner (e.g., Web3Provider)
      if (!('getSigner' in provider)) {
        setError(new Error('Provider does not support signing transactions'));
        return null;
      }
      
      // Cast to Web3Provider to access getSigner
      const web3Provider = provider as unknown as providers.Web3Provider;
      const signer = web3Provider.getSigner();
      const rewardsContract = new Contract(rewardsAddress, REWARDS_ABI, signer);
      
      // Call claim function
      const tx = await rewardsContract.claim(cometAddress, accountAddress, shouldAccrue);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setTxHash(tx.hash);
      return tx.hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress, rewardsAddress]);

  return {
    claimReward,
    loading,
    error,
    txHash
  };
} 