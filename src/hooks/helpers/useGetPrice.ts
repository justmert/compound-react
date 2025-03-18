import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseGetPriceResult {
  price: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the price of an asset in USD with 8 decimal places
 * @param client The CometClient instance
 * @param priceFeed The address of the Chainlink price feed contract for the asset
 * @returns The price in USD, loading state, error, and refetch function
 */
export function useGetPrice(
  client: CometClient | null,
  priceFeed: string | null
): UseGetPriceResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [price, setPrice] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async (): Promise<BigNumber | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!priceFeed) {
      setError(new Error('Price feed address not provided'));
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
      
      const assetPrice = await comet.getPrice(priceFeed);
      
      setPrice(assetPrice);
      return assetPrice;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, priceFeed]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice
  };
} 