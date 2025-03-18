import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useSupply } from '../../hooks/collateralAndBorrowing/useSupply';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

export interface SupplyFormProps {
  client: CometClient | null;
  assetAddress: string;
  assetSymbol?: string;
  assetDecimals?: number;
  className?: string;
  onSuccess?: (txHash: string) => void;
}

/**
 * A form component for supplying assets to the Compound protocol
 */
export const SupplyForm: React.FC<SupplyFormProps> = ({
  client,
  assetAddress,
  assetSymbol = 'Token',
  assetDecimals = 18,
  className,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [useCustomDestination, setUseCustomDestination] = useState<boolean>(false);
  
  const { supply, supplyTo, loading, error, txHash } = useSupply(client);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
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
        result = await supplyTo(destination, assetAddress, amountBN);
      } else {
        result = await supply(assetAddress, amountBN);
      }
      
      if (result && onSuccess) {
        onSuccess(result);
      }
      
      // Reset form on success
      setAmount('');
    } catch (err) {
      console.error('Error supplying assets:', err);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Supply {assetSymbol}</CardTitle>
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
                onClick={() => setAmount('0')}
                className="whitespace-nowrap"
              >
                Clear
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
            <Label htmlFor="useCustomDestination">Supply to another address</Label>
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
          {loading ? 'Processing...' : `Supply ${assetSymbol}`}
        </Button>
      </CardFooter>
    </Card>
  );
}; 