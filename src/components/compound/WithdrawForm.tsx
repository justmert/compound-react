import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWithdraw } from '../../hooks/collateralAndBorrowing/useWithdraw';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

export interface WithdrawFormProps {
  client: CometClient | null;
  assetAddress: string;
  assetSymbol?: string;
  assetDecimals?: number;
  maxAmount?: ethers.BigNumber;
  className?: string;
  onSuccess?: (txHash: string) => void;
}

/**
 * A form component for withdrawing assets from the Compound protocol
 */
export const WithdrawForm: React.FC<WithdrawFormProps> = ({
  client,
  assetAddress,
  assetSymbol = 'Token',
  assetDecimals = 18,
  maxAmount,
  className,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [useCustomDestination, setUseCustomDestination] = useState<boolean>(false);
  
  const { withdraw, withdrawTo, loading, error, txHash } = useWithdraw(client);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSetMax = () => {
    if (maxAmount) {
      setAmount(ethers.utils.formatUnits(maxAmount, assetDecimals));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    try {
      const amountBN = ethers.utils.parseUnits(amount, assetDecimals);
      
      let result: string | null;
      
      if (useCustomDestination && destination) {
        result = await withdrawTo(destination, assetAddress, amountBN);
      } else {
        result = await withdraw(assetAddress, amountBN);
      }
      
      if (result && onSuccess) {
        onSuccess(result);
      }
      
      // Reset form on success
      setAmount('');
    } catch (err) {
      console.error('Error withdrawing assets:', err);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Withdraw {assetSymbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder={`Enter ${assetSymbol} amount`}
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSetMax}
                className="whitespace-nowrap"
                disabled={!maxAmount}
              >
                Max
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useCustomDestination"
              checked={useCustomDestination}
              onChange={(e) => setUseCustomDestination(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="useCustomDestination">Withdraw to another address</Label>
          </div>
          
          {useCustomDestination && (
            <div className="space-y-2">
              <Label htmlFor="destination">Destination Address</Label>
              <Input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="0x..."
                disabled={loading}
              />
            </div>
          )}
          
          {error && (
            <div className="text-sm text-destructive">
              {error.message}
            </div>
          )}
          
          {txHash && (
            <div className="text-sm text-green-600">
              Transaction submitted: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !amount || parseFloat(amount) <= 0 || (useCustomDestination && !destination)}
          className="w-full"
        >
          {loading ? 'Processing...' : `Withdraw ${assetSymbol}`}
        </Button>
      </CardFooter>
    </Card>
  );
}; 