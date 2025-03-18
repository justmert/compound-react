import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export interface Network {
  id: number;
  name: string;
  icon?: string;
  isTestnet?: boolean;
}

export interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork?: Network;
  onNetworkSelect: (network: Network) => void;
  className?: string;
  title?: string;
}

/**
 * A component for selecting networks supported by the Compound protocol
 */
export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selectedNetwork,
  onNetworkSelect,
  className,
  title = 'Select a Network'
}) => {
  // Group networks by mainnet/testnet
  const mainnetNetworks = networks.filter(network => !network.isTestnet);
  const testnetNetworks = networks.filter(network => network.isTestnet);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {networks.length === 0 ? (
          <div className="text-center py-4">
            <p>No networks available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainnetNetworks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Mainnet</h3>
                <div className="space-y-2">
                  {mainnetNetworks.map((network) => (
                    <div
                      key={network.id}
                      className={cn(
                        "flex items-center p-3 rounded-md cursor-pointer hover:bg-accent",
                        selectedNetwork?.id === network.id ? "bg-accent" : ""
                      )}
                      onClick={() => onNetworkSelect(network)}
                    >
                      {network.icon && (
                        <div className="mr-3">
                          <img 
                            src={network.icon} 
                            alt={network.name} 
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                      )}
                      <div className="font-medium">{network.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {testnetNetworks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Testnet</h3>
                <div className="space-y-2">
                  {testnetNetworks.map((network) => (
                    <div
                      key={network.id}
                      className={cn(
                        "flex items-center p-3 rounded-md cursor-pointer hover:bg-accent",
                        selectedNetwork?.id === network.id ? "bg-accent" : ""
                      )}
                      onClick={() => onNetworkSelect(network)}
                    >
                      {network.icon && (
                        <div className="mr-3">
                          <img 
                            src={network.icon} 
                            alt={network.name} 
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                      )}
                      <div className="font-medium">{network.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 