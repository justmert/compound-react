// Comprehensive ABI for Compound III Rewards
// Based on the official Compound III documentation
export const CometRewardsABI = [
  // View functions
  "function governor() view returns (address)",
  "function rewardConfig(address comet) view returns (tuple(address token, uint64 rescaleFactor, bool shouldUpscale))",
  "function getRewardOwed(address comet, address account) view returns (tuple(address token, uint256 owed))",
  "function getRewardAccrued(address comet, address account) view returns (uint256)",
  "function rewardsClaimed(address comet, address account) view returns (uint256)",
  "function isRewardsAdmin(address account) view returns (bool)",
  
  // State-changing functions
  "function claim(address comet, address src, bool shouldAccrue)",
  "function claimTo(address comet, address src, address to, bool shouldAccrue)",
  "function claimForOwner(address comet, address owner, bool shouldAccrue)",
  "function claimMultiple(address[] comets, address[] owners, bool shouldAccrue)",
  "function addRewardsAdmin(address admin)",
  "function transferGovernor(address newGovernor)",
  "function setRewardConfig(address comet, address token, uint64 rescaleFactor, bool shouldUpscale)",
  
  // Events
  "event RewardClaimed(address indexed comet, address indexed src, address indexed recipient, address token, uint256 amount)",
  "event RewardAdminAdded(address indexed admin)",
  "event GovernorTransferred(address indexed oldGovernor, address indexed newGovernor)",
  "event RewardConfigured(address indexed comet, address indexed token, uint64 rescaleFactor, bool shouldUpscale)"
]; 