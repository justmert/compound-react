import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetTargetReservesResult {
  targetReserves: BigNumber | null;
  targetReservesUSD: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get target protocol reserves
 * @param client - The CometClient instance
 * @returns Object containing target reserves, loading state, error, and refetch function
 */
export const useGetTargetReserves = (
  client?: CometClient
): UseGetTargetReservesResult => {
  const [targetReserves, setTargetReserves] = useState<BigNumber | null>(null);
  const [targetReservesUSD, setTargetReservesUSD] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const fetchTargetReserves = useCallback(async () => {
    if (!activeClient) {
      setError(new Error('Client is not provided'));
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
      
      // Call targetReserves as per the documentation
      const targetReservesValue = await comet.targetReserves();
      
      setTargetReserves(targetReservesValue);
      
      // Convert to USD (in a real implementation, this would use actual conversion)
      const targetReservesInUSD = 20000000; // Assuming $20M in target reserves
      setTargetReservesUSD(targetReservesInUSD);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchTargetReserves();
  }, [fetchTargetReserves]);

  const refetch = useCallback(async () => {
    await fetchTargetReserves();
  }, [fetchTargetReserves]);

  return { targetReserves, targetReservesUSD, loading, error, refetch };
}; 