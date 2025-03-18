import { useState, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseAbsorbResult {
  absorb: (absorber: string, accounts: string[]) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to absorb (liquidate) underwater accounts
 * @param client - The CometClient instance
 * @returns Object containing absorb function, loading state, error, and transaction hash
 */
export const useAbsorb = (client?: CometClient): UseAbsorbResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const absorb = useCallback(async (absorber: string, accounts: string[]): Promise<string | null> => {
    if (!activeClient) {
      const err = new Error('Client is not provided');
      setError(err);
      return null;
    }

    if (!absorber) {
      const err = new Error('Absorber address is required');
      setError(err);
      return null;
    }

    if (!accounts || accounts.length === 0) {
      const err = new Error('At least one account address is required');
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
      
      // Call the absorb function
      const tx = await comet.absorb(absorber, accounts);
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

  return { absorb, loading, error, txHash };
}; 