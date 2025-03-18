export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  markets: {
    [marketName: string]: {
      cometAddress: string;
      cometRewardsAddress?: string;
      configuratorAddress?: string;
      baseAsset: string;
    }
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORKS: { [chainId: number]: NetworkConfig } = {
  // Ethereum Mainnet
  1: {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
    blockExplorerUrl: 'https://etherscan.io',
    markets: {
      USDC: {
        cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        cometRewardsAddress: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
        configuratorAddress: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
        baseAsset: 'USDC',
      },
      WETH: {
        cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        cometRewardsAddress: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
        configuratorAddress: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
        baseAsset: 'WETH',
      },
      USDT: {
        cometAddress: '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840',
        cometRewardsAddress: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
        configuratorAddress: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
        baseAsset: 'USDT',
      },
      wstETH: {
        cometAddress: '0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3',
        cometRewardsAddress: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
        configuratorAddress: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
        baseAsset: 'wstETH',
      },
      USDS: {
        cometAddress: '0x5D409e56D886231aDAf00c8775665AD0f9897b56',
        cometRewardsAddress: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
        configuratorAddress: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
        baseAsset: 'USDS',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Arbitrum
  42161: {
    name: 'Arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    markets: {
      'USDC.e': {
        cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        cometRewardsAddress: '0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae',
        configuratorAddress: '0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775',
        baseAsset: 'USDC.e',
      },
      USDC: {
        cometAddress: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
        cometRewardsAddress: '0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae',
        configuratorAddress: '0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775',
        baseAsset: 'USDC',
      },
      WETH: {
        cometAddress: '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486',
        cometRewardsAddress: '0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae',
        configuratorAddress: '0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775',
        baseAsset: 'WETH',
      },
      USDT: {
        cometAddress: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07',
        cometRewardsAddress: '0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae',
        configuratorAddress: '0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775',
        baseAsset: 'USDT',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Base
  8453: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorerUrl: 'https://basescan.org',
    markets: {
      USDC: {
        cometAddress: '0xb125E6687d4313864e53df431d5425969c15Eb2F',
        cometRewardsAddress: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1',
        configuratorAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        baseAsset: 'USDC',
      },
      USDbC: {
        cometAddress: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
        cometRewardsAddress: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1',
        configuratorAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        baseAsset: 'USDbC',
      },
      WETH: {
        cometAddress: '0x46e6b214b524310239732D51387075E0e70970bf',
        cometRewardsAddress: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1',
        configuratorAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        baseAsset: 'WETH',
      },
      AERO: {
        cometAddress: '0x784efeB622244d2348d4F2522f8860B96fbEcE89',
        cometRewardsAddress: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1',
        configuratorAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        baseAsset: 'AERO',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Polygon
  137: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    markets: {
      USDC: {
        cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        cometRewardsAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        configuratorAddress: '0x83E0F742cAcBE66349E3701B171eE2487a26e738',
        baseAsset: 'USDC',
      },
      USDT: {
        cometAddress: '0xaeB318360f27748Acb200CE616E389A6C9409a07',
        cometRewardsAddress: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
        configuratorAddress: '0x83E0F742cAcBE66349E3701B171eE2487a26e738',
        baseAsset: 'USDT',
      }
    },
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  // Optimism
  10: {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    markets: {
      USDC: {
        cometAddress: '0x2e44e174f7D53F0212823acC11C01A11d58c5bCB',
        cometRewardsAddress: '0x443EA0340cb75a160F31A440722dec7b5bc3C2E9',
        configuratorAddress: '0x84E93EC6170ED630f5ebD89A1AAE72d4F63f2713',
        baseAsset: 'USDC',
      },
      USDT: {
        cometAddress: '0x995E394b8B2437aC8Ce61Ee0bC610D617962B214',
        cometRewardsAddress: '0x443EA0340cb75a160F31A440722dec7b5bc3C2E9',
        configuratorAddress: '0x84E93EC6170ED630f5ebD89A1AAE72d4F63f2713',
        baseAsset: 'USDT',
      },
      WETH: {
        cometAddress: '0xE36A30D249f7761327fd973001A32010b521b6Fd',
        cometRewardsAddress: '0x443EA0340cb75a160F31A440722dec7b5bc3C2E9',
        configuratorAddress: '0x84E93EC6170ED630f5ebD89A1AAE72d4F63f2713',
        baseAsset: 'WETH',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Scroll
  534352: {
    name: 'Scroll',
    chainId: 534352,
    rpcUrl: 'https://rpc.scroll.io',
    blockExplorerUrl: 'https://scrollscan.com',
    markets: {
      USDC: {
        cometAddress: '0xB2f97c1Bd3bf02f5e74d13f02E3e26F93D77CE44',
        cometRewardsAddress: '0x70167D30964cbFDc315ECAe02441Af747bE0c5Ee',
        configuratorAddress: '0xECAB0bEEa3e5DEa0c35d3E69468EAC20098032D7',
        baseAsset: 'USDC',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Mantle
  5000: {
    name: 'Mantle',
    chainId: 5000,
    rpcUrl: 'https://rpc.mantle.xyz',
    blockExplorerUrl: 'https://explorer.mantle.xyz',
    markets: {
      USDe: {
        cometAddress: '0x606174f62cd968d8e684c645080fa694c1D7786E',
        cometRewardsAddress: '0xCd83CbBFCE149d141A5171C3D6a0F0fCCeE225Ab',
        configuratorAddress: '0xb77Cd4cD000957283D8BAf53cD782ECf029cF7DB',
        baseAsset: 'USDe',
      }
    },
    nativeCurrency: {
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18,
    },
  },
  // Sepolia (Testnet)
  11155111: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/your-infura-key',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    markets: {
      USDC: {
        cometAddress: '0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e',
        cometRewardsAddress: '0x8bF5b658bdF0388E8b482ED51B14aef58f90abfD',
        configuratorAddress: '0xc28aD44975C614EaBe0Ed090207314549e1c6624',
        baseAsset: 'USDC',
      },
      WETH: {
        cometAddress: '0x2943ac1216979aD8dB76D9147F64E61adc126e96',
        cometRewardsAddress: '0x8bF5b658bdF0388E8b482ED51B14aef58f90abfD',
        configuratorAddress: '0xc28aD44975C614EaBe0Ed090207314549e1c6624',
        baseAsset: 'WETH',
      }
    },
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Mumbai (Polygon Testnet)
  80001: {
    name: 'Mumbai',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    markets: {
      USDC: {
        cometAddress: '0xF09F0369aB0a875254fB565E52226c88f10Bc839',
        cometRewardsAddress: '0x0785f2AC0dCBEDEE4b8D62c25A34098E9A0dF4bB',
        configuratorAddress: '0x64550801B8bf3BF4D8792d46D8903F82e2EC95A9',
        baseAsset: 'USDC',
      }
    },
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  // Base Sepolia (Testnet)
  84532: {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    blockExplorerUrl: 'https://sepolia.basescan.org',
    markets: {
      USDC: {
        cometAddress: '0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017',
        cometRewardsAddress: '0x3394fa1baCC0b47dd0fF28C8573a476a161aF7BC',
        configuratorAddress: '0x090a2b1fc84d0b5141d5D5608b12Db19201aE5a6',
        baseAsset: 'USDC',
      },
      WETH: {
        cometAddress: '0x61490650AbaA31393464C3f34E8B29cd1C44118E',
        cometRewardsAddress: '0x3394fa1baCC0b47dd0fF28C8573a476a161aF7BC',
        configuratorAddress: '0x090a2b1fc84d0b5141d5D5608b12Db19201aE5a6',
        baseAsset: 'WETH',
      }
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
}; 