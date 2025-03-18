import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetMaxAssetsResult {
  maxAssets: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<number | null>;
}

/**
 * Hook to get the maximum number of assets that can be simultaneously supported by Compound III
 * @param client The CometClient instance
 * @returns The maximum number of assets, loading state, error, and refetch function
 */
export function useGetMaxAssets(
  client: CometClient | null
): UseGetMaxAssetsResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [maxAssets, setMaxAssets] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaxAssets = useCallback(async (): Promise<number | null> => {
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
      
      const max = await comet.maxAssets();
      
      // Convert BigNumber to number since maxAssets is a small value (uint8)
      const maxAssetsNumber = max.toNumber();
      
      setMaxAssets(maxAssetsNumber);
      return maxAssetsNumber;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchMaxAssets();
  }, [fetchMaxAssets]);

  return {
    maxAssets,
    loading,
    error,
    refetch: fetchMaxAssets
  };
} 