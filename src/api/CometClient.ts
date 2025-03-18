import { providers, Contract, BigNumber, utils } from 'ethers';
import { CometABI, CometRewardsABI, ConfiguratorABI } from '../abis';
import { NETWORKS } from '../constants/networks';

/**
 * CometClient - Core client for interacting with Compound III (Comet)
 * This client provides methods to interact with the Compound III protocol
 */
export class CometClient {
  private provider: providers.Provider;
  private cometContract: Contract | null = null;
  private rewardsContract: Contract | null = null;
  private configuratorContract: Contract | null = null;
  private chainId: number;
  private cometAddress: string | null = null;
  private rewardsAddress: string | null = null;
  private configuratorAddress: string | null = null;
  private marketName: string | null = null;

  /**
   * Create a new CometClient instance
   * @param provider - Ethers.js provider
   * @param chainId - Chain ID
   * @param cometAddress - Optional custom Comet address
   * @param rewardsAddress - Optional custom Rewards address
   * @param configuratorAddress - Optional custom Configurator address
   * @param marketName - Optional market name to use (e.g., "USDC", "WETH")
   */
  constructor(
    provider: providers.Provider,
    chainId: number,
    cometAddress?: string,
    rewardsAddress?: string,
    configuratorAddress?: string,
    marketName?: string
  ) {
    this.provider = provider;
    this.chainId = chainId;
    this.marketName = marketName || null;
    
    // If custom addresses are provided, use them
    if (cometAddress) {
      this.cometAddress = cometAddress;
    } else if (this.chainId && NETWORKS[this.chainId]) {
      // If market name is provided, use that specific market
      if (this.marketName && NETWORKS[this.chainId].markets[this.marketName]) {
        const marketConfig = NETWORKS[this.chainId].markets[this.marketName];
        this.cometAddress = marketConfig.cometAddress;
        this.rewardsAddress = marketConfig.cometRewardsAddress || null;
        this.configuratorAddress = marketConfig.configuratorAddress || null;
      } else {
        // Otherwise, use the first available market
        const markets = Object.keys(NETWORKS[this.chainId].markets);
        if (markets.length > 0) {
          const firstMarket = markets[0];
          this.marketName = firstMarket;
          const marketConfig = NETWORKS[this.chainId].markets[firstMarket];
          this.cometAddress = marketConfig.cometAddress;
          this.rewardsAddress = marketConfig.cometRewardsAddress || null;
          this.configuratorAddress = marketConfig.configuratorAddress || null;
        }
      }
    }
    
    // If rewards address is explicitly provided, use it
    if (rewardsAddress) {
      this.rewardsAddress = rewardsAddress;
    }
    
    // If configurator address is explicitly provided, use it
    if (configuratorAddress) {
      this.configuratorAddress = configuratorAddress;
    }
    
    // Initialize contracts if addresses are available
    if (this.cometAddress) {
      this.cometContract = new Contract(this.cometAddress, CometABI, provider);
    }
    
    if (this.rewardsAddress) {
      this.rewardsContract = new Contract(this.rewardsAddress, CometRewardsABI, provider);
    }
    
    if (this.configuratorAddress) {
      this.configuratorContract = new Contract(this.configuratorAddress, ConfiguratorABI, provider);
    }
  }

  /**
   * Get the Comet contract instance
   * @returns The Comet contract instance
   */
  public getComet(): Contract | null {
    return this.cometContract;
  }

  /**
   * Get the Rewards contract instance
   * @returns The Rewards contract instance
   */
  public getRewards(): Contract | null {
    return this.rewardsContract;
  }
  
  /**
   * Get the Configurator contract instance
   * @returns The Configurator contract instance
   */
  public getConfigurator(): Contract | null {
    return this.configuratorContract;
  }

  /**
   * Get the Comet address
   * @returns The Comet address
   */
  public getCometAddress(): string | null {
    return this.cometAddress;
  }

  /**
   * Get the Rewards address
   * @returns The Rewards address
   */
  public getRewardsAddress(): string | null {
    return this.rewardsAddress;
  }
  
  /**
   * Get the Configurator address
   * @returns The Configurator address
   */
  public getConfiguratorAddress(): string | null {
    return this.configuratorAddress;
  }

  /**
   * Get the current market name
   * @returns The current market name
   */
  public getMarketName(): string | null {
    return this.marketName;
  }

  /**
   * Get the provider
   * @returns The provider
   */
  public getProvider(): providers.Provider {
    return this.provider;
  }

  /**
   * Get the chain ID
   * @returns The chain ID
   */
  public getChainId(): number {
    return this.chainId;
  }

  /**
   * Set a new provider
   * @param provider - New provider
   */
  public setProvider(provider: providers.Provider): void {
    this.provider = provider;
    
    if (this.cometAddress) {
      this.cometContract = new Contract(this.cometAddress, CometABI, provider);
    }
    
    if (this.rewardsAddress) {
      this.rewardsContract = new Contract(this.rewardsAddress, CometRewardsABI, provider);
    }
    
    if (this.configuratorAddress) {
      this.configuratorContract = new Contract(this.configuratorAddress, ConfiguratorABI, provider);
    }
  }

  /**
   * Set a new market by name
   * @param marketName - Market name (e.g., "USDC", "WETH")
   * @returns True if the market was set successfully
   */
  public setMarket(marketName: string): boolean {
    if (!NETWORKS[this.chainId] || !NETWORKS[this.chainId].markets[marketName]) {
      return false;
    }
    
    const marketConfig = NETWORKS[this.chainId].markets[marketName];
    this.marketName = marketName;
    this.cometAddress = marketConfig.cometAddress;
    this.rewardsAddress = marketConfig.cometRewardsAddress || null;
    this.configuratorAddress = marketConfig.configuratorAddress || null;
    
    // Reinitialize contracts
    if (this.cometAddress) {
      this.cometContract = new Contract(this.cometAddress, CometABI, this.provider);
    }
    
    if (this.rewardsAddress) {
      this.rewardsContract = new Contract(this.rewardsAddress, CometRewardsABI, this.provider);
    }
    
    if (this.configuratorAddress) {
      this.configuratorContract = new Contract(this.configuratorAddress, ConfiguratorABI, this.provider);
    }
    
    return true;
  }

  /**
   * Set a new Comet address
   * @param cometAddress - New Comet address
   */
  public setCometAddress(cometAddress: string): void {
    this.cometAddress = cometAddress;
    this.cometContract = new Contract(cometAddress, CometABI, this.provider);
  }

  /**
   * Set a new Rewards address
   * @param rewardsAddress - New Rewards address
   */
  public setRewardsAddress(rewardsAddress: string): void {
    this.rewardsAddress = rewardsAddress;
    this.rewardsContract = new Contract(rewardsAddress, CometRewardsABI, this.provider);
  }
  
  /**
   * Set a new Configurator address
   * @param configuratorAddress - New Configurator address
   */
  public setConfiguratorAddress(configuratorAddress: string): void {
    this.configuratorAddress = configuratorAddress;
    this.configuratorContract = new Contract(configuratorAddress, ConfiguratorABI, this.provider);
  }

  /**
   * Check if the client is properly initialized
   * @returns True if the client is initialized
   */
  public isInitialized(): boolean {
    return this.cometContract !== null;
  }

  /**
   * Format a BigNumber to a human-readable string with the specified number of decimals
   * @param value - Value to format
   * @param decimals - Number of decimals
   * @returns Formatted string
   */
  public static formatUnits(value: BigNumber | string, decimals: number = 18): string {
    return utils.formatUnits(value, decimals);
  }

  /**
   * Parse a string to a BigNumber with the specified number of decimals
   * @param value - Value to parse
   * @param decimals - Number of decimals
   * @returns Parsed BigNumber
   */
  public static parseUnits(value: string, decimals: number = 18): BigNumber {
    return utils.parseUnits(value, decimals);
  }
} 