import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseUserNonceResult {
  nonce: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the current nonce for a user
 * @param client The CometClient instance
 * @param userAddress The address of the user to get the nonce for
 * @returns The current nonce for the user, loading state, error, and refetch function
 */
export function useUserNonce(
  client: CometClient | null,
  userAddress: string | null
): UseUserNonceResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [nonce, setNonce] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNonce = useCallback(async (): Promise<BigNumber | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!userAddress) {
      setError(new Error('User address not provided'));
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
      
      const userNonce = await comet.userNonce(userAddress);
      
      setNonce(userNonce);
      return userNonce;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, userAddress]);

  useEffect(() => {
    fetchNonce();
  }, [fetchNonce]);

  return {
    nonce,
    loading,
    error,
    refetch: fetchNonce
  };
} 