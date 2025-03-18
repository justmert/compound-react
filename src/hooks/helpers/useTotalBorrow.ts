import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseTotalBorrowResult {
  totalBorrow: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the total amount of base tokens that are currently borrowed from the protocol plus interest accrued to all borrows
 * @param client The CometClient instance
 * @returns The total borrow, loading state, error, and refetch function
 */
export function useTotalBorrow(client: CometClient | null): UseTotalBorrowResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [totalBorrow, setTotalBorrow] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalBorrow = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const borrow = await comet.totalBorrow();
      
      setTotalBorrow(borrow);
      return borrow;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchTotalBorrow();
  }, [fetchTotalBorrow]);

  return {
    totalBorrow,
    loading,
    error,
    refetch: fetchTotalBorrow
  };
} 