import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetFactorScaleResult {
  factorScale: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the scale for all protocol factors, i.e. borrow collateral factor
 * @param client The CometClient instance
 * @returns The factor scale, loading state, error, and refetch function
 */
export function useGetFactorScale(
  client: CometClient | null
): UseGetFactorScaleResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [factorScale, setFactorScale] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFactorScale = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const scale = await comet.factorScale();
      
      setFactorScale(scale);
      return scale;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchFactorScale();
  }, [fetchFactorScale]);

  return {
    factorScale,
    loading,
    error,
    refetch: fetchFactorScale
  };
} 