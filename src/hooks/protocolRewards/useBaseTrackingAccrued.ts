import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseBaseTrackingAccruedResult {
  accrued: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the amount of reward token accrued based on usage of the base asset
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @returns The amount of reward token accrued, loading state, error, and refetch function
 */
export function useBaseTrackingAccrued(
  client: CometClient | null,
  accountAddress: string | null
): UseBaseTrackingAccruedResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [accrued, setAccrued] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccrued = useCallback(async (): Promise<BigNumber | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!accountAddress) {
      setError(new Error('Account address not provided'));
      return null;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const trackingAccrued = await comet.baseTrackingAccrued(accountAddress);
      
      // Convert to BigNumber for consistency with other hooks
      const trackingAccruedBN = BigNumber.from(trackingAccrued);
      
      setAccrued(trackingAccruedBN);
      return trackingAccruedBN;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress]);

  useEffect(() => {
    fetchAccrued();
  }, [fetchAccrued]);

  return {
    accrued,
    loading,
    error,
    refetch: fetchAccrued
  };
} 