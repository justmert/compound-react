import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseCollateralBalanceResult {
  balance: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the collateral balance of an account
 * @param client The CometClient instance
 * @param accountAddress The address of the account
 * @param assetAddress The address of the collateral asset
 * @returns The collateral balance, loading state, error, and refetch function
 */
export function useCollateralBalance(
  client: CometClient | null,
  accountAddress: string | null,
  assetAddress: string | null
): UseCollateralBalanceResult {
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

    if (!assetAddress) {
      setError(new Error('Asset address not provided'));
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
      
      const collateralBalance = await comet.collateralBalanceOf(accountAddress, assetAddress);
      
      setBalance(collateralBalance);
      return collateralBalance;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress, assetAddress]);

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