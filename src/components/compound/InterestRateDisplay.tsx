import React from 'react';
import { ethers } from 'ethers';
import { useGetSupplyRate, SupplyRateOptions } from '../../hooks/interestRates/useGetSupplyRate';
import { useGetBorrowRate, BorrowRateOptions } from '../../hooks/interestRates/useGetBorrowRate';
import { useGetUtilization } from '../../hooks/interestRates/useGetUtilization';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface InterestRateDisplayProps {
  client: CometClient | null;
  className?: string;
  onRefresh?: () => void;
}

/**
 * A component that displays the current supply and borrow interest rates
 */
export const InterestRateDisplay: React.FC<InterestRateDisplayProps> = ({
  client,
  className,
  onRefresh
}) => {
  const { supplyRateAPY, loading: supplyLoading, error: supplyError, refetch: refetchSupply } = useGetSupplyRate(client || undefined);
  const { borrowRateAPY, loading: borrowLoading, error: borrowError, refetch: refetchBorrow } = useGetBorrowRate(client || undefined);
  const { utilization, loading: utilizationLoading, error: utilizationError, refetch: refetchUtilization } = useGetUtilization(client || undefined);

  const loading = supplyLoading || borrowLoading || utilizationLoading;
  const error = supplyError || borrowError || utilizationError;

  const handleRefresh = async () => {
    await Promise.all([
      refetchSupply(),
      refetchBorrow(),
      refetchUtilization()
    ]);
    
    if (onRefresh) onRefresh();
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatUtilization = (value: ethers.BigNumber | null) => {
    if (!value) return 'N/A';
    return `${(parseFloat(ethers.utils.formatUnits(value, 18)) * 100).toFixed(2)}%`;
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Interest Rates</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <p>Loading interest rates...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Supply APY</div>
                <div className="text-2xl font-bold text-green-600">{formatPercentage(supplyRateAPY)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Borrow APY</div>
                <div className="text-2xl font-bold text-red-600">{formatPercentage(borrowRateAPY)}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground">Utilization</div>
              <div className="text-lg font-semibold">{formatUtilization(utilization)}</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Interest rates are variable and based on market conditions.</p>
            </div>
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
          Refresh Rates
        </Button>
      </CardFooter>
    </Card>
  );
}; 