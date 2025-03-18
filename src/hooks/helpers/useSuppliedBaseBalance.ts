import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseSuppliedBaseBalanceResult {
  balance: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the current balance of base asset for a specified account in the protocol, including interest
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @returns The supplied base balance, loading state, error, and refetch function
 */
export function useSuppliedBaseBalance(
  client: CometClient | null,
  accountAddress: string | null
): UseSuppliedBaseBalanceResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const baseBalance = await comet.balanceOf(accountAddress);
      
      setBalance(baseBalance);
      return baseBalance;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
} 