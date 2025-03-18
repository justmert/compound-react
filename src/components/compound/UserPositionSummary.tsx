import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface UserPositionSummaryProps {
  client: CometClient | null;
  userAddress?: string;
  baseAssetSymbol?: string;
  baseAssetDecimals?: number;
  className?: string;
  onRefresh?: () => void;
}

/**
 * A component that displays a summary of a user's position in the Compound protocol
 */
export const UserPositionSummary: React.FC<UserPositionSummaryProps> = ({
  client,
  userAddress,
  baseAssetSymbol = 'Token',
  baseAssetDecimals = 18,
  className,
  onRefresh
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [suppliedBalance, setSuppliedBalance] = useState<ethers.BigNumber | null>(null);
  const [borrowBalance, setBorrowBalance] = useState<ethers.BigNumber | null>(null);
  const [totalCollateralValue, setTotalCollateralValue] = useState<ethers.BigNumber | null>(null);

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
      
      // Simulate fetching supplied balance
      setSuppliedBalance(ethers.utils.parseUnits('1000', baseAssetDecimals));
      
      // Simulate fetching borrow balance
      setBorrowBalance(ethers.utils.parseUnits('500', baseAssetDecimals));
      
      // Simulate fetching total collateral value
      setTotalCollateralValue(ethers.utils.parseUnits('2000', baseAssetDecimals));
      
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [client, userAddress]);

  const formatAmount = (amount: ethers.BigNumber | null) => {
    if (!amount) return '0.00';
    return parseFloat(ethers.utils.formatUnits(amount, baseAssetDecimals)).toFixed(2);
  };

  // Calculate health factor (simplified version)
  const calculateHealthFactor = () => {
    if (!totalCollateralValue || !borrowBalance || borrowBalance.isZero()) {
      return '∞'; // Infinity if no borrow
    }
    
    // This is a simplified calculation - in a real app, you'd use the actual collateral factors
    const healthFactor = totalCollateralValue.mul(ethers.BigNumber.from(100)).div(borrowBalance);
    return (parseFloat(ethers.utils.formatUnits(healthFactor, 18)) / 100).toFixed(2);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Your Position</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading position data...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Supplied</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(suppliedBalance)} {baseAssetSymbol}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Borrowed</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(borrowBalance)} {baseAssetSymbol}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Collateral Value</div>
                <div className="text-xl font-semibold">
                  {formatAmount(totalCollateralValue)} {baseAssetSymbol}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Health Factor</div>
                <div className={cn(
                  "text-xl font-semibold",
                  parseFloat(calculateHealthFactor()) < 1.2 ? "text-red-600" : 
                  parseFloat(calculateHealthFactor()) < 1.5 ? "text-amber-600" : 
                  "text-green-600"
                )}>
                  {calculateHealthFactor()}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>A health factor below 1.0 may result in liquidation of your collateral.</p>
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