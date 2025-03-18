import { providers, Contract } from 'ethers';

export interface CompoundConfig {
  chainId: number;
  rpcUrl?: string;
  provider?: providers.Provider;
  cometAddress?: string;
}

export interface CompoundContext {
  provider: providers.Provider | null;
  chainId: number;
  cometContract: Contract | null;
  isConnected: boolean;
}

export interface TransactionResponse {
  hash: string;
  wait: () => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  status: number;
  transactionHash: string;
  blockNumber: number;
}

export interface Market {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  supplyRate: number;
  borrowRate: number;
  liquidity: string;
  price: string;
  totalSupply: string;
  totalBorrow: string;
}

export interface UserPosition {
  supplyBalance: string;
  borrowBalance: string;
  collateralBalance: string;
  netAPR: number;
}

export interface Asset {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price: string;
  isCollateral: boolean;
  borrowCollateralFactor: number;
  liquidateCollateralFactor: number;
  supplyRate: number;
  borrowRate: number;
} 