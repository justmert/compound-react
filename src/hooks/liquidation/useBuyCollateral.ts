import { useState, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseBuyCollateralResult {
  buyCollateral: (
    asset: string,
    minAmount: BigNumber,
    baseAmount: BigNumber,
    recipient: string
  ) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to buy collateral from liquidated positions
 * @param client - The CometClient instance
 * @returns Object containing buyCollateral function, loading state, error, and transaction hash
 */
export const useBuyCollateral = (client?: CometClient): UseBuyCollateralResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const buyCollateral = useCallback(async (
    asset: string,
    minAmount: BigNumber,
    baseAmount: BigNumber,
    recipient: string
  ): Promise<string | null> => {
    if (!activeClient) {
      const err = new Error('Client is not provided');
      setError(err);
      return null;
    }

    if (!asset) {
      const err = new Error('Asset address is required');
      setError(err);
      return null;
    }

    if (!recipient) {
      const err = new Error('Recipient address is required');
      setError(err);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!activeClient.isInitialized()) {
        throw new Error('Client is not initialized');
      }

      const comet = activeClient.getComet();
      
      if (!comet) {
        throw new Error('Comet contract is not available');
      }
      
      // Call the buyCollateral function
      const tx = await comet.buyCollateral(asset, minAmount, baseAmount, recipient);
      const receipt = await tx.wait();
      const transactionHash = receipt.transactionHash;
      
      setTxHash(transactionHash);
      setLoading(false);
      return transactionHash;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return null;
    }
  }, [activeClient]);

  return { buyCollateral, loading, error, txHash };
}; 