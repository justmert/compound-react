import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetBaseAccrualScaleResult {
  baseAccrualScale: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the scale for the base asset tracking accrual
 * @param client The CometClient instance
 * @returns The base accrual scale, loading state, error, and refetch function
 */
export function useGetBaseAccrualScale(
  client: CometClient | null
): UseGetBaseAccrualScaleResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [baseAccrualScale, setBaseAccrualScale] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBaseAccrualScale = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const scale = await comet.baseAccrualScale();
      
      setBaseAccrualScale(scale);
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
    fetchBaseAccrualScale();
  }, [fetchBaseAccrualScale]);

  return {
    baseAccrualScale,
    loading,
    error,
    refetch: fetchBaseAccrualScale
  };
} 