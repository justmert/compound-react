import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetAskPriceResult {
  askPrice: BigNumber | null;
  askPriceUSD: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the ask price for a collateral asset
 * @param asset - The address of the collateral asset
 * @param baseAmount - The amount of base tokens to quote
 * @param client - The CometClient instance
 * @returns Object containing ask price, loading state, error, and refetch function
 */
export const useGetAskPrice = (
  asset: string,
  baseAmount: BigNumber,
  client?: CometClient
): UseGetAskPriceResult => {
  const [askPrice, setAskPrice] = useState<BigNumber | null>(null);
  const [askPriceUSD, setAskPriceUSD] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const fetchAskPrice = useCallback(async () => {
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
      
      // Call quoteCollateral as per the documentation
      const collateralAmount = await comet.quoteCollateral(asset, baseAmount);
      
      setAskPrice(collateralAmount);
      
      // Convert to USD (in a real implementation, this would use actual conversion)
      const priceInUSD = 2000; // Assuming 1 ETH = $2000
      setAskPriceUSD(priceInUSD);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [activeClient, asset, baseAmount]);

  useEffect(() => {
    fetchAskPrice();
  }, [fetchAskPrice]);

  const refetch = useCallback(async () => {
    await fetchAskPrice();
  }, [fetchAskPrice]);

  return { askPrice, askPriceUSD, loading, error, refetch };
}; 