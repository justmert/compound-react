import { useState, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseAccrueAccountResult {
  accrueAccount: (accountAddress: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to trigger a manual accrual of interest and rewards to an account
 * @param client The CometClient instance
 * @returns The accrueAccount function, loading state, and error
 */
export function useAccrueAccount(client: CometClient | null): UseAccrueAccountResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const accrueAccount = useCallback(async (accountAddress: string): Promise<boolean> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return false;
    }

    if (!accountAddress) {
      setError(new Error('Account address not provided'));
      return false;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return false;
      }
      
      const tx = await comet.accrueAccount(accountAddress);
      await tx.wait();
      
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  return {
    accrueAccount,
    loading,
    error
  };
} 