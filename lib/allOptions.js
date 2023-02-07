const { SignerWithAddress } = require("hardhat-deploy-ethers/signers")
const { ethers } = require("hardhat")

async function allOptions() {


    let httpProvider = new ethers.providers.JsonRpcBatchProvider()
    let contractAddress = "0xdA772d07af26aE731aEc509154C06F96261ff16a"
    let contract = new ethers.Contract(contractAddress, abi, httpProvider)

    // filter = {
    //     optionID: 1571,
    //     topics: [utils.id("Acquired(uint256,uint256,uint256,uint256,uint32)")]
    // }
    const hre = require("hardhat")
    const [deployer] = await hre.ethers.getSigners()
    let ddl = await hre.ethers.getContract("DDL_ETH")
    let HegicStrategyATM_CALL_ETH = await hre.ethers.getContract("HegicStrategyATM_CALL_ETH")
    let optionList = await HegicStrategyATM_CALL_ETH.filters(1571)


    console.log('allOptions', optionList)
    return (HegicStrategyATM_CALL_ETH)
}

allOptions()
