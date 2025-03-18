import { useState, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface AllowBySigParams {
  owner: string;
  manager: string;
  isAllowed: boolean;
  nonce: BigNumber;
  expiry: BigNumber;
  v: number;
  r: string;
  s: string;
}

export interface UseAllowBySigResult {
  allowBySig: (params: AllowBySigParams) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to allow or disallow another address to withdraw or transfer on behalf of an owner's address using an EIP-712 signature
 * @param client - The CometClient instance
 * @returns Object containing allowBySig function, loading state, error, and transaction hash
 */
export const useAllowBySig = (client?: CometClient): UseAllowBySigResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;

  const allowBySig = useCallback(async (params: AllowBySigParams): Promise<string | null> => {
    if (!activeClient) {
      const err = new Error('Client is not provided');
      setError(err);
      return null;
    }

    const { owner, manager, isAllowed, nonce, expiry, v, r, s } = params;

    if (!owner) {
      const err = new Error('Owner address is required');
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
      
      // Call the allowBySig function
      const tx = await comet.allowBySig(
        owner,
        manager,
        isAllowed,
        nonce,
        expiry,
        v,
        r,
        s
      );
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

  return { allowBySig, loading, error, txHash };
}; 