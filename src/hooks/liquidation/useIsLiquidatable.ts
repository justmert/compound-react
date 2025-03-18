import { useState, useEffect, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseIsLiquidatableResult {
  isLiquidatable: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if an account is liquidatable
 * @param account - The address of the account to check
 * @param client - The CometClient instance
 * @returns Object containing liquidatable status, loading state, error, and refetch function
 */
export const useIsLiquidatable = (
  account: string,
  client?: CometClient
): UseIsLiquidatableResult => {
  const [isLiquidatable, setIsLiquidatable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const checkLiquidatable = useCallback(async () => {
    if (!activeClient) {
      setError(new Error('Client is not provided'));
      setLoading(false);
      return;
    }

    if (!account) {
      setError(new Error('Account address is required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!activeClient.isInitialized()) {
        throw new Error('Client is not initialized');
      }

      const comet = activeClient.getComet();
      
      if (!comet) {
        throw new Error('Comet contract is not available');
      }
      
      // Call the isLiquidatable function as per the documentation
      const liquidatableStatus = await comet.isLiquidatable(account);
      
      setIsLiquidatable(liquidatableStatus);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient, account]);

  useEffect(() => {
    checkLiquidatable();
  }, [checkLiquidatable]);

  const refetch = useCallback(async () => {
    await checkLiquidatable();
  }, [checkLiquidatable]);

  return { isLiquidatable, loading, error, refetch };
}; 