import React from 'react';
import { ethers } from 'ethers';
import { useGetAssetInfo, AssetInfo } from '../../hooks/helpers/useGetAssetInfo';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface AssetInfoCardProps {
  client: CometClient | null;
  assetIndex: number;
  className?: string;
  onRefresh?: () => void;
}

/**
 * A card component that displays information about a collateral asset
 */
export const AssetInfoCard: React.FC<AssetInfoCardProps> = ({
  client,
  assetIndex,
  className,
  onRefresh
}) => {
  const { assetInfo, loading, error, refetch } = useGetAssetInfo(client, assetIndex);

  // Format collateral factors to percentages
  const formatCollateralFactor = (factor: ethers.BigNumber | undefined) => {
    if (!factor) return 'N/A';
    return `${ethers.utils.formatUnits(factor, 18).slice(0, 6)}%`;
  };
  
  // Format supply cap to token amount
  const formatSupplyCap = (cap: ethers.BigNumber | undefined) => {
    if (!cap) return 'N/A';
    return ethers.utils.formatUnits(cap, 18);
  };

  const handleRefresh = async () => {
    await refetch();
    if (onRefresh) onRefresh();
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Asset Information</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading asset information...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : assetInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Asset Address:</div>
              <div className="text-sm truncate">{assetInfo.asset}</div>
              
              <div className="text-sm font-medium">Price Feed:</div>
              <div className="text-sm truncate">{assetInfo.priceFeed}</div>
              
              <div className="text-sm font-medium">Borrow Collateral Factor:</div>
              <div className="text-sm">{formatCollateralFactor(assetInfo.borrowCollateralFactor)}</div>
              
              <div className="text-sm font-medium">Liquidate Collateral Factor:</div>
              <div className="text-sm">{formatCollateralFactor(assetInfo.liquidateCollateralFactor)}</div>
              
              <div className="text-sm font-medium">Liquidation Factor:</div>
              <div className="text-sm">{formatCollateralFactor(assetInfo.liquidationFactor)}</div>
              
              <div className="text-sm font-medium">Supply Cap:</div>
              <div className="text-sm">{formatSupplyCap(assetInfo.supplyCap)}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p>No asset information available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRefresh} 
          disabled={loading}
          variant="outline"
          className="ml-auto"
        >
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}; 