import { BigNumber, utils } from 'ethers';

/**
 * Format a BigNumber to a human-readable string with the specified number of decimals
 */
export function formatUnits(value: BigNumber | string, decimals: number = 18): string {
  return utils.formatUnits(value, decimals);
}

/**
 * Parse a string to a BigNumber with the specified number of decimals
 */
export function parseUnits(value: string, decimals: number = 18): BigNumber {
  return utils.parseUnits(value, decimals);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number as USD
 */
export function formatUSD(value: number | string, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Shorten an Ethereum address
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Convert an annual rate to APY
 */
export function calculateAPY(ratePerSecond: number): number {
  const secondsPerYear = 60 * 60 * 24 * 365;
  return Math.pow(1 + ratePerSecond, secondsPerYear) - 1;
}

/**
 * Convert a rate per second to APR
 */
export function calculateAPR(ratePerSecond: number): number {
  const secondsPerYear = 60 * 60 * 24 * 365;
  return ratePerSecond * secondsPerYear;
} 