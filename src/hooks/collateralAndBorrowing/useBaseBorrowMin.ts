import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseBaseBorrowMinResult {
  baseBorrowMin: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the minimum borrow balance allowed
 * @param client The CometClient instance
 * @returns The minimum borrow balance, loading state, error, and refetch function
 */
export function useBaseBorrowMin(client: CometClient | null): UseBaseBorrowMinResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [baseBorrowMin, setBaseBorrowMin] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBaseBorrowMin = useCallback(async (): Promise<BigNumber | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
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
      
      const minBorrowBalance = await comet.baseBorrowMin();
      
      setBaseBorrowMin(minBorrowBalance);
      return minBorrowBalance;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchBaseBorrowMin();
  }, [fetchBaseBorrowMin]);

  return {
    baseBorrowMin,
    loading,
    error,
    refetch: fetchBaseBorrowMin
  };
} 