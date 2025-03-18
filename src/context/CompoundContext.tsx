import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { providers } from 'ethers';
import { CometClient } from '../api/CometClient';
import { NETWORKS } from '../constants/networks';

interface CompoundContextType {
  client: CometClient | null;
  isInitialized: boolean;
  error: Error | null;
  setChainId: (chainId: number) => void;
  setProvider: (provider: providers.Provider) => void;
  setMarket: (marketName: string) => void;
  availableMarkets: string[];
  currentMarket: string | null;
}

interface CompoundProviderProps {
  children: ReactNode;
  provider: providers.Provider;
  chainId: number;
  initialMarket?: string;
  cometAddress?: string;
  rewardsAddress?: string;
  configuratorAddress?: string;
}

// Create context with default values
const CompoundContext = createContext<CompoundContextType>({
  client: null,
  isInitialized: false,
  error: null,
  setChainId: () => {},
  setProvider: () => {},
  setMarket: () => {},
  availableMarkets: [],
  currentMarket: null,
});

/**
 * Provider component that wraps the application and provides Compound context
 */
export const CompoundProvider: React.FC<CompoundProviderProps> = ({
  children,
  provider,
  chainId,
  initialMarket,
  cometAddress,
  rewardsAddress,
  configuratorAddress,
}) => {
  const [client, setClient] = useState<CometClient | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number>(chainId);
  const [currentProvider, setCurrentProvider] = useState<providers.Provider>(provider);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [currentMarket, setCurrentMarket] = useState<string | null>(initialMarket || null);

  // Update available markets when chain ID changes
  useEffect(() => {
    const networkConfig = NETWORKS[currentChainId];
    if (networkConfig) {
      const markets = Object.keys(networkConfig.markets);
      setAvailableMarkets(markets);
      
      // If current market is not available in the new chain, select the first available market
      if (markets.length > 0 && (!currentMarket || !markets.includes(currentMarket))) {
        setCurrentMarket(markets[0]);
      }
    } else {
      setAvailableMarkets([]);
      setCurrentMarket(null);
    }
  }, [currentChainId, currentMarket]);

  // Initialize or update the client when provider, chainId, or market changes
  useEffect(() => {
    try {
      // Create a new client instance
      const newClient = new CometClient(
        currentProvider,
        currentChainId,
        cometAddress,
        rewardsAddress,
        configuratorAddress,
        currentMarket || undefined
      );
      
      setClient(newClient);
      setIsInitialized(newClient.isInitialized());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize CometClient'));
      setIsInitialized(false);
    }
  }, [currentProvider, currentChainId, currentMarket, cometAddress, rewardsAddress, configuratorAddress]);

  // Handler for changing the chain ID
  const handleSetChainId = (newChainId: number) => {
    setCurrentChainId(newChainId);
  };

  // Handler for changing the provider
  const handleSetProvider = (newProvider: providers.Provider) => {
    setCurrentProvider(newProvider);
  };

  // Handler for changing the market
  const handleSetMarket = (marketName: string) => {
    // If we already have a client, try to update its market directly
    if (client && !cometAddress) {
      const success = client.setMarket(marketName);
      if (success) {
        setCurrentMarket(marketName);
        setIsInitialized(client.isInitialized());
        return;
      }
    }
    
    // Otherwise, update the state to trigger a client recreation
    setCurrentMarket(marketName);
  };

  const contextValue: CompoundContextType = {
    client,
    isInitialized,
    error,
    setChainId: handleSetChainId,
    setProvider: handleSetProvider,
    setMarket: handleSetMarket,
    availableMarkets,
    currentMarket,
  };

  return (
    <CompoundContext.Provider value={contextValue}>
      {children}
    </CompoundContext.Provider>
  );
};

/**
 * Hook to use the Compound context
 */
export const useCompoundContext = (): CompoundContextType => {
  const context = useContext(CompoundContext);
  
  if (context === undefined) {
    throw new Error('useCompoundContext must be used within a CompoundProvider');
  }
  
  return context;
}; 