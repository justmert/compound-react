import { useState, useEffect, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseVersionResult {
  version: string | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<string | null>;
}

/**
 * Hook to get the current version of the Comet contract
 * @param client The CometClient instance
 * @returns The current version of the Comet contract, loading state, error, and refetch function
 */
export function useVersion(client: CometClient | null): UseVersionResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersion = useCallback(async (): Promise<string | null> => {
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
      
      const contractVersion = await comet.version();
      
      setVersion(contractVersion);
      return contractVersion;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient]);

  useEffect(() => {
    fetchVersion();
  }, [fetchVersion]);

  return {
    version,
    loading,
    error,
    refetch: fetchVersion
  };
} 