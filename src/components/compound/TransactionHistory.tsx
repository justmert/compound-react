import React, { useState, useEffect } from 'react';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface Transaction {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'liquidation' | 'other';
  timestamp: number;
  hash: string;
  amount: string;
  asset: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionHistoryProps {
  client: CometClient | null;
  userAddress?: string;
  className?: string;
  onRefresh?: () => void;
  maxItems?: number;
}

/**
 * A component that displays transaction history for a user
 */
export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  client,
  userAddress,
  className,
  onRefresh,
  maxItems = 10
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = async () => {
    if (!client) {
      setError(new Error('Client not provided'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would fetch transactions from the client
      // For now, we're just simulating the data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'supply',
          timestamp: Date.now() - 3600000, // 1 hour ago
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          amount: '1000',
          asset: 'USDC',
          status: 'confirmed'
        },
        {
          id: '2',
          type: 'borrow',
          timestamp: Date.now() - 7200000, // 2 hours ago
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          amount: '500',
          asset: 'USDC',
          status: 'confirmed'
        },
        {
          id: '3',
          type: 'withdraw',
          timestamp: Date.now() - 86400000, // 1 day ago
          hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
          amount: '200',
          asset: 'USDC',
          status: 'confirmed'
        },
        {
          id: '4',
          type: 'repay',
          timestamp: Date.now() - 172800000, // 2 days ago
          hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
          amount: '100',
          asset: 'USDC',
          status: 'confirmed'
        }
      ];
      
      setTransactions(mockTransactions.slice(0, maxItems));
      
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [client, userAddress, maxItems]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'supply': return 'Supply';
      case 'withdraw': return 'Withdraw';
      case 'borrow': return 'Borrow';
      case 'repay': return 'Repay';
      case 'liquidation': return 'Liquidation';
      default: return 'Other';
    }
  };

  const getTransactionTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'supply': return 'text-green-600';
      case 'withdraw': return 'text-amber-600';
      case 'borrow': return 'text-red-600';
      case 'repay': return 'text-blue-600';
      case 'liquidation': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-destructive">
            <p>Error: {error.message}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className={cn("font-medium", getTransactionTypeColor(tx.type))}>
                      {getTransactionTypeLabel(tx.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {tx.type === 'withdraw' || tx.type === 'borrow' ? '-' : '+'}{tx.amount} {tx.asset}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    tx.status === 'confirmed' ? "bg-green-100 text-green-800" :
                    tx.status === 'pending' ? "bg-amber-100 text-amber-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
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