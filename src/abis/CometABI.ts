// Comprehensive ABI for Compound III (Comet)
// Based on the official Compound III documentation
export const CometABI = [
  // View functions - Basic Information
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function version() view returns (string)",
  "function baseToken() view returns (address)",
  "function baseTokenPriceFeed() view returns (address)",
  "function governor() view returns (address)",
  "function pauseGuardian() view returns (address)",
  "function isAbsorbPaused() view returns (bool)",
  "function isSupplyPaused() view returns (bool)",
  "function isTransferPaused() view returns (bool)",
  "function isWithdrawPaused() view returns (bool)",
  "function isBuyPaused() view returns (bool)",
  "function extensionDelegate() view returns (address)",

  // View functions - Protocol Configuration
  "function maxAssets() view returns (uint8)",
  "function baseAccrualScale() view returns (uint64)",
  "function baseIndexScale() view returns (uint64)",
  "function factorScale() view returns (uint64)",
  "function priceScale() view returns (uint64)",
  "function supplyKink() view returns (uint64)",
  "function supplyPerSecondInterestRateSlopeLow() view returns (uint64)",
  "function supplyPerSecondInterestRateSlopeHigh() view returns (uint64)",
  "function supplyPerSecondInterestRateBase() view returns (uint64)",
  "function borrowKink() view returns (uint64)",
  "function borrowPerSecondInterestRateSlopeLow() view returns (uint64)",
  "function borrowPerSecondInterestRateSlopeHigh() view returns (uint64)",
  "function borrowPerSecondInterestRateBase() view returns (uint64)",
  "function storeFrontPriceFactor() view returns (uint64)",
  "function targetReserves() view returns (uint104)",
  "function baseMinForRewards() view returns (uint104)",
  "function baseTrackingSupplySpeed() view returns (uint104)",
  "function baseTrackingBorrowSpeed() view returns (uint104)",

  // View functions - Market Information
  "function totalSupply() view returns (uint256)",
  "function totalBorrow() view returns (uint256)",
  "function getReserves() view returns (int256)",
  "function getUtilization() view returns (uint256)",
  "function getSupplyRate(uint256 utilization) view returns (uint256)",
  "function getBorrowRate(uint256 utilization) view returns (uint256)",
  "function getPrice(address priceFeed) view returns (uint128)",
  "function getAssetInfo(uint8 i) view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))",
  "function getAssetInfoByAddress(address asset) view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))",
  "function totalsBasic() view returns (tuple(uint64 baseSupplyIndex, uint64 baseBorrowIndex, uint64 trackingSupplyIndex, uint64 trackingBorrowIndex, uint104 totalSupplyBase, uint104 totalBorrowBase, uint40 lastAccrualTime, uint8 pauseFlags))",
  "function baseTokenBalance() view returns (uint256)",

  // View functions - Account Information
  "function balanceOf(address account) view returns (uint256)",
  "function borrowBalanceOf(address account) view returns (uint256)",
  "function collateralBalanceOf(address account, address asset) view returns (uint256)",
  "function userBasic(address account) view returns (tuple(int104 principal, uint64 baseTrackingIndex, uint64 baseTrackingAccrued, uint16 assetsIn))",
  "function userCollateral(address account, address asset) view returns (tuple(uint128 balance, uint128 _reserved))",
  "function userNonce(address account) view returns (uint256)",
  "function hasPermission(address owner, address manager) view returns (bool)",
  "function isAllowed(address owner, address manager) view returns (bool)",
  "function quoteCollateral(address asset, uint256 baseAmount) view returns (uint256)",
  "function getAssetList() view returns (address[])",
  "function getAssetListLength() view returns (uint8)",
  "function getAssetListByAddress(address asset) view returns (uint8)",
  "function getCollateralReserves(address asset) view returns (uint256)",
  "function isBorrowCollateralized(address account) view returns (bool)",
  "function isLiquidatable(address account) view returns (bool)",
  
  // State-changing functions - Supply and Withdraw
  "function supply(address asset, uint256 amount)",
  "function supplyTo(address dst, address asset, uint256 amount)",
  "function supplyFrom(address from, address dst, address asset, uint256 amount)",
  "function withdraw(address asset, uint256 amount)",
  "function withdrawTo(address to, address asset, uint256 amount)",
  "function withdrawFrom(address src, address to, address asset, uint256 amount)",
  
  // State-changing functions - Transfers
  "function transfer(address dst, uint256 amount) returns (bool)",
  "function transferFrom(address src, address dst, uint256 amount) returns (bool)",
  "function transferAsset(address dst, address asset, uint256 amount)",
  "function transferAssetFrom(address src, address dst, address asset, uint256 amount)",
  
  // State-changing functions - Liquidation
  "function absorb(address absorber, address[] accounts)",
  "function buyCollateral(address asset, uint256 minAmount, uint256 baseAmount, address recipient)",
  
  // State-changing functions - Permissions
  "function allow(address manager, bool isAllowed)",
  "function allowBySig(address owner, address manager, bool isAllowed, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)",
  
  // State-changing functions - Protocol Management
  "function accrueAccount(address account)",
  "function pause(bool supplyPaused, bool transferPaused, bool withdrawPaused, bool absorbPaused, bool buyPaused)",
  "function setBaseTrackingSupplySpeed(uint104 newBaseTrackingSupplySpeed)",
  "function setBaseTrackingBorrowSpeed(uint104 newBaseTrackingBorrowSpeed)",
  
  // Events
  "event Supply(address indexed from, address indexed dst, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
  "event Withdraw(address indexed src, address indexed to, uint256 amount)",
  "event AbsorbCollateral(address indexed absorber, address indexed borrower, address indexed asset, uint256 collateralAbsorbed, uint256 usdValue)",
  "event AbsorbDebt(address indexed absorber, address indexed borrower, uint256 basePaidOut, uint256 usdValue)",
  "event BuyCollateral(address indexed buyer, address indexed asset, uint256 baseAmount, uint256 collateralAmount)",
  "event PauseAction(bool supplyPaused, bool transferPaused, bool withdrawPaused, bool absorbPaused, bool buyPaused)",
  "event WithdrawReserves(address indexed to, uint256 amount)",
  "event SupplyCollateral(address indexed from, address indexed dst, address indexed asset, uint256 amount)",
  "event TransferCollateral(address indexed from, address indexed to, address indexed asset, uint256 amount)",
  "event WithdrawCollateral(address indexed src, address indexed to, address indexed asset, uint256 amount)"
]; 