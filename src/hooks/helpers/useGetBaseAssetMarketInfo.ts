import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface TotalsBasic {
  baseSupplyIndex: BigNumber;
  baseBorrowIndex: BigNumber;
  trackingSupplyIndex: BigNumber;
  trackingBorrowIndex: BigNumber;
  totalSupplyBase: BigNumber;
  totalBorrowBase: BigNumber;
  lastAccrualTime: BigNumber;
  pauseFlags: number;
}

export interface UseGetBaseAssetMarketInfoResult {
  marketInfo: TotalsBasic | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<TotalsBasic | null>;
}

/**
 * Hook to get several of the current parameter values for the protocol market
 * @param client The CometClient instance
 * @returns The base asset market information, loading state, error, and refetch function
 */
export function useGetBaseAssetMarketInfo(
  client: CometClient | null
): UseGetBaseAssetMarketInfoResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [marketInfo, setMarketInfo] = useState<TotalsBasic | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarketInfo = useCallback(async (): Promise<TotalsBasic | null> => {
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
      
      const totalsBasic = await comet.totalsBasic();
      
      const marketInfoData: TotalsBasic = {
        baseSupplyIndex: totalsBasic.baseSupplyIndex,
        baseBorrowIndex: totalsBasic.baseBorrowIndex,
        trackingSupplyIndex: totalsBasic.trackingSupplyIndex,
        trackingBorrowIndex: totalsBasic.trackingBorrowIndex,
        totalSupplyBase: totalsBasic.totalSupplyBase,
        totalBorrowBase: totalsBasic.totalBorrowBase,
        lastAccrualTime: totalsBasic.lastAccrualTime,
        pauseFlags: totalsBasic.pauseFlags
      };
      
      setMarketInfo(marketInfoData);
      return marketInfoData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchMarketInfo();
  }, [fetchMarketInfo]);

  return {
    marketInfo,
    loading,
    error,
    refetch: fetchMarketInfo
  };
} 