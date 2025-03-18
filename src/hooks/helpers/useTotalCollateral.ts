import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface TotalsCollateral {
  totalSupplyAsset: BigNumber;
  reserved: BigNumber;
}

export interface UseTotalCollateralResult {
  totalsCollateral: TotalsCollateral | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<TotalsCollateral | null>;
}

/**
 * Hook to get the total amount of a specific collateral asset supplied to the protocol
 * @param client The CometClient instance
 * @param assetAddress The address of the collateral asset
 * @returns The total collateral, loading state, error, and refetch function
 */
export function useTotalCollateral(
  client: CometClient | null,
  assetAddress: string | null
): UseTotalCollateralResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [totalsCollateral, setTotalsCollateral] = useState<TotalsCollateral | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalCollateral = useCallback(async (): Promise<TotalsCollateral | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!assetAddress) {
      setError(new Error('Asset address not provided'));
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
      
      const [totalSupplyAsset, reserved] = await comet.totalsCollateral(assetAddress);
      
      const collateral: TotalsCollateral = {
        totalSupplyAsset,
        reserved
      };
      
      setTotalsCollateral(collateral);
      return collateral;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, assetAddress]);

  useEffect(() => {
    fetchTotalCollateral();
  }, [fetchTotalCollateral]);

  return {
    totalsCollateral,
    loading,
    error,
    refetch: fetchTotalCollateral
  };
} 