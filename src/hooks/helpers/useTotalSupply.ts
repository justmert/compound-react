import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseTotalSupplyResult {
  totalSupply: BigNumber | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<BigNumber | null>;
}

/**
 * Hook to get the total supply of base tokens supplied to the protocol plus interest accrued to suppliers
 * @param client The CometClient instance
 * @returns The total supply, loading state, error, and refetch function
 */
export function useTotalSupply(client: CometClient | null): UseTotalSupplyResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [totalSupply, setTotalSupply] = useState<BigNumber | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalSupply = useCallback(async (): Promise<BigNumber | null> => {
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
      
      const supply = await comet.totalSupply();
      
      setTotalSupply(supply);
      return supply;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchTotalSupply();
  }, [fetchTotalSupply]);

  return {
    totalSupply,
    loading,
    error,
    refetch: fetchTotalSupply
  };
} 