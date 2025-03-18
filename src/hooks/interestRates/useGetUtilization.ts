import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

/**
 * Interface for the utilization hook return value
 */
export interface UtilizationData {
  utilization: BigNumber | null;
  utilizationRate: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current utilization rate from Compound III
 * 
 * The utilization rate is the ratio of borrowed assets to supplied assets.
 * It's a key factor in determining interest rates in the protocol.
 * 
 * @param clientOrOptions - Optional CometClient instance or options
 * @returns Object containing utilization data, loading state, error, and refetch function
 */
export function useGetUtilization(clientOrOptions?: CometClient | { chainId?: number }): UtilizationData {
  const context = useCompoundContext();
  
  // Determine which client to use
  const client = clientOrOptions instanceof CometClient 
    ? clientOrOptions 
    : context.client;
  
  const [utilization, setUtilization] = useState<BigNumber | null>(null);
  const [utilizationRate, setUtilizationRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUtilization = useCallback(async () => {
    if (!client || !client.isInitialized()) {
      setError(new Error('CometClient is not initialized'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const comet = client.getComet();
      if (!comet) {
        throw new Error('Comet contract is not available');
      }

      // Get the current utilization from the Comet contract
      const utilizationBN = await comet.getUtilization();
      setUtilization(utilizationBN);

      // Convert to a percentage (0-100)
      // Utilization is returned as a value scaled by 1e18
      const utilizationRateValue = parseFloat(
        CometClient.formatUnits(utilizationBN, 18)
      ) * 100;
      
      setUtilizationRate(utilizationRateValue);
    } catch (err) {
      console.error('Error fetching utilization rate:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching utilization rate'));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchUtilization();
  }, [fetchUtilization]);

  return {
    utilization,
    utilizationRate,
    loading,
    error,
    refetch: fetchUtilization
  };
} 