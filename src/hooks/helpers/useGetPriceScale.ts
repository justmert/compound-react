import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetPriceScaleResult {
  priceScale: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the scale integer for USD prices in the protocol, i.e. 8 decimals = 1e8
 * @param client The CometClient instance
 * @returns The price scale, loading state, error, and refetch function
 */
export function useGetPriceScale(
  client: CometClient | null
): UseGetPriceScaleResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [priceScale, setPriceScale] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriceScale = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const scale = await comet.priceScale();
      
      setPriceScale(scale);
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
    fetchPriceScale();
  }, [fetchPriceScale]);

  return {
    priceScale,
    loading,
    error,
    refetch: fetchPriceScale
  };
} 