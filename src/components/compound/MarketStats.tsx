import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface MarketStatsProps {
  client: CometClient | null;
  baseAssetSymbol?: string;
  baseAssetDecimals?: number;
  className?: string;
  onRefresh?: () => void;
}

/**
 * A component that displays market statistics for the Compound protocol
 */
export const MarketStats: React.FC<MarketStatsProps> = ({
  client,
  baseAssetSymbol = 'Token',
  baseAssetDecimals = 18,
  className,
  onRefresh
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber | null>(null);
  const [totalBorrow, setTotalBorrow] = useState<ethers.BigNumber | null>(null);
  const [utilization, setUtilization] = useState<number | null>(null);
  const [supplyRate, setSupplyRate] = useState<number | null>(null);
  const [borrowRate, setBorrowRate] = useState<number | null>(null);

  const fetchData = async () => {
    if (!client) {
      setError(new Error('Client not provided'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use the actual hooks here
      // For now, we're just simulating the data
      
      // Simulate fetching total supply
      const mockTotalSupply = ethers.utils.parseUnits('10000000', baseAssetDecimals);
      setTotalSupply(mockTotalSupply);
      
      // Simulate fetching total borrow
      const mockTotalBorrow = ethers.utils.parseUnits('5000000', baseAssetDecimals);
      setTotalBorrow(mockTotalBorrow);
      
      // Calculate utilization
      const utilizationRate = mockTotalBorrow.mul(100).div(mockTotalSupply);
      setUtilization(parseFloat(ethers.utils.formatUnits(utilizationRate, 0)));
      
      // Simulate fetching supply rate
      setSupplyRate(2.5);
      
      // Simulate fetching borrow rate
      setBorrowRate(4.8);
      
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [client]);

  const formatAmount = (amount: ethers.BigNumber | null) => {
    if (!amount) return '0.00';
    const formatted = parseFloat(ethers.utils.formatUnits(amount, baseAssetDecimals));
    
    // Format with commas for thousands
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(formatted);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Market Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading market data...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Supply</div>
                <div className="text-2xl font-bold">
                  {formatAmount(totalSupply)} {baseAssetSymbol}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Borrow</div>
                <div className="text-2xl font-bold">
                  {formatAmount(totalBorrow)} {baseAssetSymbol}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Utilization</div>
                <div className="text-xl font-semibold">
                  {utilization !== null ? `${utilization}%` : 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Supply APY</div>
                  <div className="text-lg font-semibold text-green-600">
                    {supplyRate !== null ? `${supplyRate.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Borrow APY</div>
                  <div className="text-lg font-semibold text-red-600">
                    {borrowRate !== null ? `${borrowRate.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={fetchData} 
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