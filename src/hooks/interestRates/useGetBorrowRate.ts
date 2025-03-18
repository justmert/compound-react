import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useGetUtilization } from './useGetUtilization';
import { useCompoundContext } from '../../context/CompoundContext';

/**
 * Interface for the borrow rate hook return value
 */
export interface BorrowRateData {
  borrowRate: BigNumber | null;
  borrowRateAPR: number | null;
  borrowRateAPY: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Interface for the borrow rate hook options
 */
export interface BorrowRateOptions {
  chainId?: number;
  customUtilization?: BigNumber;
}

/**
 * Hook to get the current borrow interest rate from Compound III
 * 
 * The borrow rate is the interest rate paid by borrowers of the base asset.
 * It's determined by the utilization rate and the interest rate model parameters.
 * 
 * @param clientOrOptions - Optional CometClient instance or options
 * @param customUtilization - Optional custom utilization rate to calculate borrow rate for
 * @returns Object containing borrow rate data, loading state, error, and refetch function
 */
export function useGetBorrowRate(
  clientOrOptions?: CometClient | BorrowRateOptions,
  customUtilization?: BigNumber
): BorrowRateData {
  const context = useCompoundContext();
  
  // Determine which client to use and extract options
  let client: CometClient | null;
  let utilizationOverride: BigNumber | undefined;
  
  if (clientOrOptions instanceof CometClient) {
    client = clientOrOptions;
    utilizationOverride = customUtilization;
  } else if (clientOrOptions && 'customUtilization' in clientOrOptions) {
    client = context.client;
    utilizationOverride = clientOrOptions.customUtilization;
  } else {
    client = context.client;
    utilizationOverride = customUtilization;
  }

  const [borrowRate, setBorrowRate] = useState<BigNumber | null>(null);
  const [borrowRateAPR, setBorrowRateAPR] = useState<number | null>(null);
  const [borrowRateAPY, setBorrowRateAPY] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get the current utilization if no custom utilization is provided
  const { utilization: currentUtilization, loading: utilizationLoading, error: utilizationError } = 
    useGetUtilization(client ? client : undefined);

  const fetchBorrowRate = useCallback(async () => {
    if (!client || !client.isInitialized()) {
      setError(new Error('CometClient is not initialized'));
      setLoading(false);
      return;
    }

    // If we're using current utilization and it's still loading, wait
    if (!utilizationOverride && utilizationLoading) {
      return;
    }

    // If there was an error fetching utilization, propagate it
    if (!utilizationOverride && utilizationError) {
      setError(utilizationError);
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

      // Use custom utilization if provided, otherwise use current utilization
      const utilizationToUse = utilizationOverride || currentUtilization;
      
      if (!utilizationToUse) {
        throw new Error('Utilization is not available');
      }

      // Get the borrow rate for the given utilization
      const borrowRateBN = await comet.getBorrowRate(utilizationToUse);
      setBorrowRate(borrowRateBN);

      // Convert to APR (Annual Percentage Rate)
      // Borrow rate is returned as a per-second rate scaled by 1e18
      const secondsPerYear = 60 * 60 * 24 * 365;
      const borrowRatePerSecond = parseFloat(CometClient.formatUnits(borrowRateBN, 18));
      const apr = borrowRatePerSecond * secondsPerYear * 100; // Convert to percentage
      setBorrowRateAPR(apr);

      // Convert to APY (Annual Percentage Yield) with compounding
      const apy = (Math.pow(1 + borrowRatePerSecond, secondsPerYear) - 1) * 100; // Convert to percentage
      setBorrowRateAPY(apy);
    } catch (err) {
      console.error('Error fetching borrow rate:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching borrow rate'));
    } finally {
      setLoading(false);
    }
  }, [client, utilizationOverride, currentUtilization, utilizationLoading, utilizationError]);

  useEffect(() => {
    fetchBorrowRate();
  }, [fetchBorrowRate]);

  return {
    borrowRate,
    borrowRateAPR,
    borrowRateAPY,
    loading,
    error,
    refetch: fetchBorrowRate
  };
} 