import { useState, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseTransferResult {
  transfer: (destination: string, amount: BigNumber) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to transfer base tokens from the sender to a destination address
 * @param client The CometClient instance
 * @returns The transfer function, loading state, error, and transaction hash
 */
export function useTransfer(client: CometClient | null): UseTransferResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const transfer = useCallback(async (
    destination: string,
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
      
      const tx = await comet.transfer(destination, amount);
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
    transfer,
    loading,
    error,
    txHash
  };
} 