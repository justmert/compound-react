import { Contract, providers } from 'ethers';
import { CometABI, CometRewardsABI } from '../abis';
import { NETWORKS } from '../constants/networks';

/**
 * Get a Comet contract instance
 */
export function getCometContract(
  provider: providers.Provider,
  chainId: number,
  cometAddress?: string,
  market: string = 'USDC' // Default to USDC market
): Contract | null {
  try {
    const address = cometAddress || NETWORKS[chainId]?.markets[market]?.cometAddress;
    if (!address) return null;
    
    return new Contract(address, CometABI, provider);
  } catch (error) {
    console.error('Error creating Comet contract:', error);
    return null;
  }
}

/**
 * Get a Comet Rewards contract instance
 */
export function getCometRewardsContract(
  provider: providers.Provider,
  chainId: number,
  rewardsAddress?: string,
  market: string = 'USDC' // Default to USDC market
): Contract | null {
  try {
    const address = rewardsAddress || NETWORKS[chainId]?.markets[market]?.cometRewardsAddress;
    if (!address) return null;
    
    return new Contract(address, CometRewardsABI, provider);
  } catch (error) {
    console.error('Error creating Comet Rewards contract:', error);
    return null;
  }
}

/**
 * Get an ERC20 contract instance
 */
export function getERC20Contract(
  provider: providers.Provider,
  tokenAddress: string
): Contract | null {
  try {
    const ERC20_ABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function balanceOf(address owner) view returns (uint256)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 value) returns (bool)',
      'function transfer(address to, uint256 value) returns (bool)',
      'function transferFrom(address from, address to, uint256 value) returns (bool)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)',
    ];
    
    return new Contract(tokenAddress, ERC20_ABI, provider);
  } catch (error) {
    console.error('Error creating ERC20 contract:', error);
    return null;
  }
} 