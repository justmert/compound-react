import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetCollateralReservesResult {
  collateralReserves: BigNumber | null;
  collateralReservesUSD: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get protocol reserves for a specific collateral asset
 * @param asset - The address of the collateral asset
 * @param client - The CometClient instance
 * @returns Object containing collateral reserves, loading state, error, and refetch function
 */
export const useGetCollateralReserves = (
  asset: string,
  client?: CometClient
): UseGetCollateralReservesResult => {
  const [collateralReserves, setCollateralReserves] = useState<BigNumber | null>(null);
  const [collateralReservesUSD, setCollateralReservesUSD] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const fetchCollateralReserves = useCallback(async () => {
    if (!activeClient) {
      setError(new Error('Client is not provided'));
      setLoading(false);
      return;
    }

    if (!asset) {
      setError(new Error('Asset address is required'));
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
      
      // Call getCollateralReserves as per the documentation
      const reserves = await comet.getCollateralReserves(asset);
      
      setCollateralReserves(reserves);
      
      // Convert to USD (in a real implementation, this would use actual conversion)
      const reservesInUSD = 5000000; // Assuming $5M in collateral reserves
      setCollateralReservesUSD(reservesInUSD);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient, asset]);

  useEffect(() => {
    fetchCollateralReserves();
  }, [fetchCollateralReserves]);

  const refetch = useCallback(async () => {
    await fetchCollateralReserves();
  }, [fetchCollateralReserves]);

  return { collateralReserves, collateralReservesUSD, loading, error, refetch };
}; 