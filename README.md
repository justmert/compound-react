# Compound React

A complete React kit for interacting with Compound III protocol across all supported networks and markets.

See the documentation: https://compound-react.mintlify.app/

[![npm](https://img.shields.io/npm/v/compound-react-kit)](https://www.npmjs.com/package/compound-react-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install compound-react-kit
```

or

```bash
yarn add compound-react-kit
```

## Features

- Complete React integration for Compound III protocol
- Ready-to-use UI components built with shadcn/ui
- Powerful React hooks for all protocol functionality
- TypeScript support
- Multi-network and multi-market support
- Simple provider-based configuration

## Quick Start

```jsx
import { CompoundProvider, useGetAssetInfo, AssetInfoCard } from 'compound-react-kit';
import { providers } from 'ethers';

function App() {
  const provider = new providers.Web3Provider(window.ethereum);
  
  return (
    <CompoundProvider 
      provider={provider}
      chainId={1} // Ethereum Mainnet
      initialMarket="USDC" // Optional
    >
      <YourComponent />
    </CompoundProvider>
  );
}

function YourComponent() {
  // Using hooks approach
  const { data, isLoading, error } = useGetAssetInfo(0);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {/* Using UI components approach */}
      <AssetInfoCard assetIndex={0} />
      
      {/* Or custom UI with hooks data */}
      <div className="custom-card">
        <h2>Asset Info</h2>
        <p>Asset Address: {data?.asset}</p>
        <p>Collateral Factor: {data?.borrowCollateralFactor.toString()}</p>
      </div>
    </div>
  );
}
```

## Supported Networks

- Ethereum Mainnet
- Arbitrum
- Base
- Polygon
- Optimism
- Scroll
- Mantle
- Various testnets (Sepolia, Mumbai, Base Sepolia)


## Documentation

For complete documentation, visit [our documentation](https://compound-react.mintlify.app/) <!-- Replace with actual docs URL when available -->

## Package Contents

- **UI Components**: Ready-to-use interface elements for Compound III
- **React Hooks**: Data fetching and state management for protocol interactions
- **Account Management**: Managing user accounts and permissions
- **Collateral and Borrowing**: Supplying collateral and borrowing assets
- **Interest Rates**: Getting interest rate information
- **Liquidation**: Liquidation-related functionality
- **Protocol Rewards**: Managing protocol rewards

## License

MIT 
