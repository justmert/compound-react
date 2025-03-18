import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface LiquidatorPoints {
  numAbsorbs: number;
  numAbsorbed: number;
  approxSpend: BigNumber;
}

export interface UseGetLiquidatorPointsResult {
  points: LiquidatorPoints | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get liquidator points for an address
 * @param address - The address to check points for
 * @param client - The CometClient instance
 * @returns Object containing points, loading state, error, and refetch function
 */
export const useGetLiquidatorPoints = (
  address: string,
  client?: CometClient
): UseGetLiquidatorPointsResult => {
  const [points, setPoints] = useState<LiquidatorPoints | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const fetchLiquidatorPoints = useCallback(async () => {
    if (!activeClient) {
      setError(new Error('Client is not provided'));
      setLoading(false);
      return;
    }

    if (!address) {
      setError(new Error('Address is required'));
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
      
      // Access the liquidatorPoints mapping
      const liquidatorPointsData = await comet.liquidatorPoints(address);
      const [numAbsorbs, numAbsorbed, approxSpend] = liquidatorPointsData;
      
      setPoints({
        numAbsorbs,
        numAbsorbed,
        approxSpend
      });
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient, address]);

  useEffect(() => {
    fetchLiquidatorPoints();
  }, [fetchLiquidatorPoints]);

  const refetch = useCallback(async () => {
    await fetchLiquidatorPoints();
  }, [fetchLiquidatorPoints]);

  return { points, loading, error, refetch };
}; 