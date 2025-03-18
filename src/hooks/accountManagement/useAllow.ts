import { useState, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseAllowResult {
  allow: (manager: string, isAllowed: boolean) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to allow or disallow another address to withdraw or transfer on behalf of the sender's address
 * @param client - The CometClient instance
 * @returns Object containing allow function, loading state, error, and transaction hash
 */
export const useAllow = (client?: CometClient): UseAllowResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const allow = useCallback(async (
    manager: string,
    isAllowed: boolean
  ): Promise<string | null> => {
    if (!activeClient) {
      const err = new Error('Client is not provided');
      setError(err);
      return null;
    }

    if (!manager) {
      const err = new Error('Manager address is required');
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
      
      // Call the allow function
      const tx = await comet.allow(manager, isAllowed);
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

  return { allow, loading, error, txHash };
}; 