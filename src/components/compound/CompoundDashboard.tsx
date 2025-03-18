import React, { useState } from 'react';
import { CometClient } from '../../api/CometClient';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { UserPositionSummary } from './UserPositionSummary';
import { InterestRateDisplay } from './InterestRateDisplay';
import { MarketStats } from './MarketStats';
import { AssetInfoCard } from './AssetInfoCard';
import { TransactionHistory } from './TransactionHistory';
import { Asset } from '../../types';

export interface CompoundDashboardProps {
  client: CometClient | null;
  userAddress?: string;
  baseAssetSymbol?: string;
  baseAssetDecimals?: number;
  className?: string;
}

/**
 * A dashboard component that combines several Compound components
 */
export const CompoundDashboard: React.FC<CompoundDashboardProps> = ({
  client,
  userAddress,
  baseAssetSymbol = 'USDC',
  baseAssetDecimals = 6,
  className
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(0);

  const handleRefresh = () => {
    console.log('Dashboard refreshed');
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Compound III Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="supply">Supply & Borrow</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserPositionSummary 
                  client={client}
                  userAddress={userAddress}
                  baseAssetSymbol={baseAssetSymbol}
                  baseAssetDecimals={baseAssetDecimals}
                  onRefresh={handleRefresh}
                />
                <InterestRateDisplay 
                  client={client}
                  onRefresh={handleRefresh}
                />
              </div>
              <MarketStats 
                client={client}
                baseAssetSymbol={baseAssetSymbol}
                baseAssetDecimals={baseAssetDecimals}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="supply" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserPositionSummary 
                  client={client}
                  userAddress={userAddress}
                  baseAssetSymbol={baseAssetSymbol}
                  baseAssetDecimals={baseAssetDecimals}
                  onRefresh={handleRefresh}
                />
                <InterestRateDisplay 
                  client={client}
                  onRefresh={handleRefresh}
                />
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-center">Supply and borrow forms would go here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="assets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Select Asset</h3>
                  </div>
                  <div className="space-y-2">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center p-3 rounded-md cursor-pointer hover:bg-accent",
                          selectedAssetIndex === index ? "bg-accent" : ""
                        )}
                        onClick={() => setSelectedAssetIndex(index)}
                      >
                        <div className="font-medium">Asset {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <AssetInfoCard 
                  client={client}
                  assetIndex={selectedAssetIndex}
                  onRefresh={handleRefresh}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <TransactionHistory 
                client={client}
                userAddress={userAddress}
                onRefresh={handleRefresh}
                maxItems={5}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 