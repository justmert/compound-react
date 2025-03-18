import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UserBasic {
  principal: BigNumber;
  baseTrackingIndex: BigNumber;
  baseTrackingAccrued: BigNumber;
  assetsIn: BigNumber;
}

export interface UseUserBasicResult {
  userBasic: UserBasic | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<UserBasic | null>;
}

/**
 * Hook to get account data like principal, baseTrackingIndex, baseTrackingAccrued, and assetsIn
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @returns The user basic data, loading state, error, and refetch function
 */
export function useUserBasic(
  client: CometClient | null,
  accountAddress: string | null
): UseUserBasicResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [userBasic, setUserBasic] = useState<UserBasic | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserBasic = useCallback(async (): Promise<UserBasic | null> => {
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
      
      const [principal, baseTrackingIndex, baseTrackingAccrued, assetsIn] = await comet.userBasic(accountAddress);
      
      const userData: UserBasic = {
        principal,
        baseTrackingIndex,
        baseTrackingAccrued,
        assetsIn
      };
      
      setUserBasic(userData);
      return userData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress]);

  useEffect(() => {
    fetchUserBasic();
  }, [fetchUserBasic]);

  return {
    userBasic,
    loading,
    error,
    refetch: fetchUserBasic
  };
} 