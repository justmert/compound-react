// Comprehensive ABI for Compound III Configurator
// Based on the official Compound III documentation
export const ConfiguratorABI = [
  // View functions
  "function getConfiguration(address cometProxy) view returns (tuple(address governor, address pauseGuardian, address baseToken, address baseTokenPriceFeed, address extensionDelegate, uint64 supplyKink, uint64 supplyPerYearInterestRateSlopeLow, uint64 supplyPerYearInterestRateSlopeHigh, uint64 supplyPerYearInterestRateBase, uint64 borrowKink, uint64 borrowPerYearInterestRateSlopeLow, uint64 borrowPerYearInterestRateSlopeHigh, uint64 borrowPerYearInterestRateBase, uint64 storeFrontPriceFactor, uint64 trackingIndexScale, uint64 baseTrackingSupplySpeed, uint64 baseTrackingBorrowSpeed, uint104 baseMinForRewards, uint104 baseBorrowMin, uint104 targetReserves))",
  "function factory(address cometProxy) view returns (address)",
  
  // Governance functions
  "function setFactory(address cometProxy, address newFactory)",
  "function setGovernor(address cometProxy, address newGovernor)",
  "function setPauseGuardian(address cometProxy, address newPauseGuardian)",
  "function setBaseTokenPriceFeed(address cometProxy, address newBaseTokenPriceFeed)",
  "function setExtensionDelegate(address cometProxy, address newExtensionDelegate)",
  "function setBorrowKink(address cometProxy, uint64 newKink)",
  "function setBorrowPerYearInterestRateSlopeLow(address cometProxy, uint64 newSlope)",
  "function setBorrowPerYearInterestRateSlopeHigh(address cometProxy, uint64 newSlope)",
  "function setBorrowPerYearInterestRateBase(address cometProxy, uint64 newBase)",
  "function setSupplyKink(address cometProxy, uint64 newKink)",
  "function setSupplyPerYearInterestRateSlopeLow(address cometProxy, uint64 newSlope)",
  "function setSupplyPerYearInterestRateSlopeHigh(address cometProxy, uint64 newSlope)",
  "function setSupplyPerYearInterestRateBase(address cometProxy, uint64 newBase)",
  "function setStoreFrontPriceFactor(address cometProxy, uint64 newStoreFrontPriceFactor)",
  "function setBaseTrackingSupplySpeed(address cometProxy, uint64 newBaseTrackingSupplySpeed)",
  "function setBaseTrackingBorrowSpeed(address cometProxy, uint64 newBaseTrackingBorrowSpeed)",
  "function setBaseMinForRewards(address cometProxy, uint104 newBaseMinForRewards)",
  "function setBaseBorrowMin(address cometProxy, uint104 newBaseBorrowMin)",
  "function setTargetReserves(address cometProxy, uint104 newTargetReserves)",
  "function addAsset(address cometProxy, tuple(address asset, address priceFeed, uint8 decimals, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap) assetConfig)",
  "function updateAsset(address cometProxy, tuple(address asset, address priceFeed, uint8 decimals, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap) newAssetConfig)",
  "function updateAssetPriceFeed(address cometProxy, address asset, address newPriceFeed)",
  "function updateAssetBorrowCollateralFactor(address cometProxy, address asset, uint64 newBorrowCF)",
  "function updateAssetLiquidateCollateralFactor(address cometProxy, address asset, uint64 newLiquidateCF)",
  "function updateAssetLiquidationFactor(address cometProxy, address asset, uint64 newLiquidationFactor)",
  "function updateAssetSupplyCap(address cometProxy, address asset, uint128 newSupplyCap)",
  "function transferGovernor(address newGovernor)",
  
  // Events
  "event GovernorTransferred(address indexed oldGovernor, address indexed newGovernor)",
  "event FactorySet(address indexed cometProxy, address indexed oldFactory, address indexed newFactory)",
  "event GovernorSet(address indexed cometProxy, address indexed oldGovernor, address indexed newGovernor)",
  "event PauseGuardianSet(address indexed cometProxy, address indexed oldPauseGuardian, address indexed newPauseGuardian)",
  "event BaseTokenPriceFeedSet(address indexed cometProxy, address indexed oldPriceFeed, address indexed newPriceFeed)",
  "event ExtensionDelegateSet(address indexed cometProxy, address indexed oldDelegate, address indexed newDelegate)",
  "event AssetAdded(address indexed cometProxy, address indexed asset)",
  "event AssetUpdated(address indexed cometProxy, address indexed asset)"
]; 