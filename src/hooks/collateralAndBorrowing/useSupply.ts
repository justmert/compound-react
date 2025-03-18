import { useState, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseSupplyResult {
  supply: (asset: string, amount: BigNumber) => Promise<string | null>;
  supplyTo: (destination: string, asset: string, amount: BigNumber) => Promise<string | null>;
  supplyFrom: (from: string, destination: string, asset: string, amount: BigNumber) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to supply assets to the protocol
 * @param client The CometClient instance
 * @returns Functions to supply assets, loading state, error, and transaction hash
 */
export function useSupply(client: CometClient | null): UseSupplyResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const supply = useCallback(async (
    asset: string,
    amount: BigNumber
  ): Promise<string | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!asset) {
      setError(new Error('Asset address not provided'));
      return null;
    }

    if (!amount || amount.lte(0)) {
      setError(new Error('Invalid amount'));
      return null;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const tx = await comet.supply(asset, amount);
      const receipt = await tx.wait();
      
      setTxHash(receipt.transactionHash);
      return receipt.transactionHash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  const supplyTo = useCallback(async (
    destination: string,
    asset: string,
    amount: BigNumber
  ): Promise<string | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!destination) {
      setError(new Error('Destination address not provided'));
      return null;
    }

    if (!asset) {
      setError(new Error('Asset address not provided'));
      return null;
    }

    if (!amount || amount.lte(0)) {
      setError(new Error('Invalid amount'));
      return null;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const tx = await comet.supplyTo(destination, asset, amount);
      const receipt = await tx.wait();
      
      setTxHash(receipt.transactionHash);
      return receipt.transactionHash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  const supplyFrom = useCallback(async (
    from: string,
    destination: string,
    asset: string,
    amount: BigNumber
  ): Promise<string | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!from) {
      setError(new Error('From address not provided'));
      return null;
    }

    if (!destination) {
      setError(new Error('Destination address not provided'));
      return null;
    }

    if (!asset) {
      setError(new Error('Asset address not provided'));
      return null;
    }

    if (!amount || amount.lte(0)) {
      setError(new Error('Invalid amount'));
      return null;
    }

    if (!activeClient.isInitialized()) {
      setError(new Error('Client not initialized'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const comet = activeClient.getComet();
      if (!comet) {
        setError(new Error('Comet contract not available'));
        return null;
      }
      
      const tx = await comet.supplyFrom(from, destination, asset, amount);
      const receipt = await tx.wait();
      
      setTxHash(receipt.transactionHash);
      return receipt.transactionHash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  return {
    supply,
    supplyTo,
    supplyFrom,
    loading,
    error,
    txHash
  };
} 