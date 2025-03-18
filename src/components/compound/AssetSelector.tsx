import React, { useState, useEffect } from 'react';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Asset } from '../../types';

export interface AssetSelectorProps {
  client: CometClient | null;
  onAssetSelect: (asset: Asset) => void;
  selectedAsset?: Asset;
  className?: string;
  title?: string;
}

/**
 * A component for selecting assets from the Compound protocol
 */
export const AssetSelector: React.FC<AssetSelectorProps> = ({
  client,
  onAssetSelect,
  selectedAsset,
  className,
  title = 'Select an Asset'
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!client) {
        setError(new Error('Client not provided'));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // In a real implementation, you would fetch the assets from the client
        // For now, we're just simulating the data
        const mockAssets: Asset[] = [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            price: '1.00',
            isCollateral: true,
            borrowCollateralFactor: 0.8,
            liquidateCollateralFactor: 0.85,
            supplyRate: 0.03,
            borrowRate: 0.05
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Wrapped Ether',
            symbol: 'WETH',
            decimals: 18,
            price: '3000.00',
            isCollateral: true,
            borrowCollateralFactor: 0.7,
            liquidateCollateralFactor: 0.75,
            supplyRate: 0.01,
            borrowRate: 0.03
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Wrapped Bitcoin',
            symbol: 'WBTC',
            decimals: 8,
            price: '50000.00',
            isCollateral: true,
            borrowCollateralFactor: 0.6,
            liquidateCollateralFactor: 0.65,
            supplyRate: 0.005,
            borrowRate: 0.02
          }
        ];
        
        setAssets(mockAssets);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [client]);

  const handleAssetSelect = (asset: Asset) => {
    onAssetSelect(asset);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading assets...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-4">
            <p>No assets available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.address}
                className={cn(
                  "flex items-center p-3 rounded-md cursor-pointer hover:bg-accent",
                  selectedAsset?.address === asset.address ? "bg-accent" : ""
                )}
                onClick={() => handleAssetSelect(asset)}
              >
                <div className="flex-1">
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${asset.price}</div>
                  <div className="text-sm text-muted-foreground">
                    Supply APY: {(asset.supplyRate * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 