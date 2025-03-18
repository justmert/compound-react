import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface AssetInfo {
  offset: number;
  asset: string;
  priceFeed: string;
  scale: BigNumber;
  borrowCollateralFactor: BigNumber;
  liquidateCollateralFactor: BigNumber;
  liquidationFactor: BigNumber;
  supplyCap: BigNumber;
}

export interface UseGetAssetInfoResult {
  assetInfo: AssetInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<AssetInfo | null>;
}

/**
 * Hook to get collateral asset information such as the collateral factors, asset price feed address, and more
 * @param client The CometClient instance
 * @param assetIndex The index of the collateral asset based on the order it was added to the protocol
 * @returns The asset info, loading state, error, and refetch function
 */
export function useGetAssetInfo(
  client: CometClient | null,
  assetIndex: number
): UseGetAssetInfoResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssetInfo = useCallback(async (): Promise<AssetInfo | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (assetIndex < 0) {
      setError(new Error('Asset index must be a non-negative integer'));
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
      
      const info = await comet.getAssetInfo(assetIndex);
      
      const assetInfoData: AssetInfo = {
        offset: info.offset,
        asset: info.asset,
        priceFeed: info.priceFeed,
        scale: info.scale,
        borrowCollateralFactor: info.borrowCollateralFactor,
        liquidateCollateralFactor: info.liquidateCollateralFactor,
        liquidationFactor: info.liquidationFactor,
        supplyCap: info.supplyCap
      };
      
      setAssetInfo(assetInfoData);
      return assetInfoData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, assetIndex]);

  useEffect(() => {
    fetchAssetInfo();
  }, [fetchAssetInfo]);

  return {
    assetInfo,
    loading,
    error,
    refetch: fetchAssetInfo
  };
} 