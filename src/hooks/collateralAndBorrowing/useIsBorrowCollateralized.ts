import { useState, useEffect, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseIsBorrowCollateralizedResult {
  isCollateralized: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<boolean | null>;
}

/**
 * Hook to check if an account has enough collateral for borrowing
 * @param client The CometClient instance
 * @param accountAddress The address of the account to check
 * @returns Whether the account is collateralized, loading state, error, and refetch function
 */
export function useIsBorrowCollateralized(
  client: CometClient | null,
  accountAddress: string | null
): UseIsBorrowCollateralizedResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [isCollateralized, setIsCollateralized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const checkCollateralization = useCallback(async (): Promise<boolean | null> => {
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
      
      const collateralized = await comet.isBorrowCollateralized(accountAddress);
      
      setIsCollateralized(collateralized);
      return collateralized;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, accountAddress]);

  useEffect(() => {
    checkCollateralization();
  }, [checkCollateralization]);

  return {
    isCollateralized,
    loading,
    error,
    refetch: checkCollateralization
  };
} 