import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseBorrowBalanceResult {
  borrowBalance: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the current balance of borrowed base asset for a specified account in the protocol, including interest
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @returns The borrow balance, loading state, error, and refetch function
 */
export function useBorrowBalance(
  client: CometClient | null,
  accountAddress: string | null
): UseBorrowBalanceResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [borrowBalance, setBorrowBalance] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBorrowBalance = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const borrowBal = await comet.borrowBalanceOf(accountAddress);
      
      setBorrowBalance(borrowBal);
      return borrowBal;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress]);

  useEffect(() => {
    fetchBorrowBalance();
  }, [fetchBorrowBalance]);

  return {
    borrowBalance,
    loading,
    error,
    refetch: fetchBorrowBalance
  };
} 