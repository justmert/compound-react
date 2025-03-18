import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';
import { AssetInfo } from './useGetAssetInfo';

export interface UseGetAssetInfoByAddressResult {
  assetInfo: AssetInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<AssetInfo | null>;
}

/**
 * Hook to get information of a specific collateral asset by its address
 * @param client The CometClient instance
 * @param assetAddress The address of the collateral asset
 * @returns The asset info, loading state, error, and refetch function
 */
export function useGetAssetInfoByAddress(
  client: CometClient | null,
  assetAddress: string | null
): UseGetAssetInfoByAddressResult {
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
      
      const info = await comet.getAssetInfoByAddress(assetAddress);
      
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
  }, [activeClient, assetAddress]);

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