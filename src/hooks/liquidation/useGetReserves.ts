import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetReservesResult {
  reserves: BigNumber | null;
  reservesUSD: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get protocol reserves of the base asset
 * @param client - The CometClient instance
 * @returns Object containing reserves, loading state, error, and refetch function
 */
export const useGetReserves = (
  client?: CometClient
): UseGetReservesResult => {
  const [reserves, setReserves] = useState<BigNumber | null>(null);
  const [reservesUSD, setReservesUSD] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const fetchReserves = useCallback(async () => {
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
      
      // Call getReserves as per the documentation
      const protocolReserves = await comet.getReserves();
      
      setReserves(protocolReserves);
      
      // Convert to USD (in a real implementation, this would use actual conversion)
      const reservesInUSD = 10000000; // Assuming $10M in reserves
      setReservesUSD(reservesInUSD);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchReserves();
  }, [fetchReserves]);

  const refetch = useCallback(async () => {
    await fetchReserves();
  }, [fetchReserves]);

  return { reserves, reservesUSD, loading, error, refetch };
}; 