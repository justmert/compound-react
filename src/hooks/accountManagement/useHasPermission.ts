import { useState, useEffect, useCallback } from 'react';
import { CometClient } from '../../api/CometClient';
import { useCompoundContext } from '../../context/CompoundContext';

export interface UseHasPermissionResult {
  hasPermission: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<boolean | null>;
}

/**
 * Hook to check if a manager has permission to act on behalf of an owner
 * @param client The CometClient instance
 * @param ownerAddress The address of the owner
 * @param managerAddress The address of the manager
 * @returns Whether the manager has permission, loading state, error, and refetch function
 */
export function useHasPermission(
  client: CometClient | null,
  ownerAddress: string | null,
  managerAddress: string | null
): UseHasPermissionResult {
  const { client: contextClient } = useCompoundContext();
  const activeClient = client || contextClient;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = useCallback(async (): Promise<boolean | null> => {
    if (!activeClient) {
      setError(new Error('Client not provided'));
      return null;
    }

    if (!ownerAddress) {
      setError(new Error('Owner address not provided'));
      return null;
    }

    if (!managerAddress) {
      setError(new Error('Manager address not provided'));
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
      
      const permission = await comet.hasPermission(ownerAddress, managerAddress);
      
      setHasPermission(permission);
      return permission;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeClient, ownerAddress, managerAddress]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    loading,
    error,
    refetch: checkPermission
  };
} 