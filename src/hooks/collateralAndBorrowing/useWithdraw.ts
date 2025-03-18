import { useState, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseWithdrawResult {
  withdraw: (asset: string, amount: BigNumber) => Promise<string | null>;
  withdrawTo: (to: string, asset: string, amount: BigNumber) => Promise<string | null>;
  withdrawFrom: (src: string, to: string, asset: string, amount: BigNumber) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

/**
 * Hook to withdraw collateral or borrow base assets from the protocol
 * @param client The CometClient instance
 * @returns Functions to withdraw assets, loading state, error, and transaction hash
 */
export function useWithdraw(client: CometClient | null): UseWithdrawResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const withdraw = useCallback(async (
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
      
      const tx = await comet.withdraw(asset, amount);
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

  const withdrawTo = useCallback(async (
    to: string,
    asset: string,
    amount: BigNumber
  ): Promise<string | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!to) {
      setError(new Error('Recipient address not provided'));
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
      
      const tx = await comet.withdrawTo(to, asset, amount);
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

  const withdrawFrom = useCallback(async (
    src: string,
    to: string,
    asset: string,
    amount: BigNumber
  ): Promise<string | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!src) {
      setError(new Error('Source address not provided'));
      return null;
    }

    if (!to) {
      setError(new Error('Recipient address not provided'));
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
      
      const tx = await comet.withdrawFrom(src, to, asset, amount);
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
    withdraw,
    withdrawTo,
    withdrawFrom,
    loading,
    error,
    txHash
  };
} 