require("@nomicfoundation/hardhat-toolbox");
require("hardhat-local-networks-config-plugin")
require("hardhat-deploy-ethers")
require("hardhat-deploy")

module.exports = {
  localNetworksConfig: "~/.hardhat/networks.json",
  solidity: {
    version: "0.8.9"
  },
  paths: {
    artifacts: './src/artifacts'
  },
  defaultNetwork: "hardhat",
  networks: {
    arbitrum_ddl: {
      chanId: 42161,
      url: "https://arb-mainnet.g.alchemy.com/v2/5ZdGJb2c1DWObl73ERVIL3PTUl6UCMRA",    
    }
  }
};
