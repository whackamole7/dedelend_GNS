const { SignerWithAddress } = require("hardhat-deploy-ethers/signers")

export async function totalBalance() {
    const hre = require("hardhat")
    let ddl = await hre.ethers.getContract("DDL_ETH")
    let totalBalance = await ddl.totalBalance()
    
    // return (ethers.utils.formatUnits(totalBalance, 6))
    console.log('totalBalance', ethers.utils.formatUnits(totalBalance, 6))
}

async function totalLocked() {
    const hre = require("hardhat")
    let ddl = await hre.ethers.getContract("DDL_ETH")
    let totalLocked = await ddl.totalLocked()
    // return (ethers.utils.formatUnits(totalLocked, 6))
    console.log('totalLoccked', ethers.utils.formatUnits(totalLocked, 6))
}

async function approve() {
    const hre = require("hardhat")
    const [deployer] = await hre.ethers.getSigners()
    let ddl = await hre.ethers.getContract("DDL_ETH")
    let optionManager = await hre.ethers.getContract("OptionsManager")

    let lockOption = await optionManager.connect(deployer).approve(ddl.address, 1570,
        {
            gasLimit: 1000000, gasPrice: 400000000,
        })
    console.log('approve', lockOption)
    return (await lockOption)
}

async function lockOption(
    user, optioniD) {
    const hre = require("hardhat")
    const [deployer] = await hre.ethers.getSigners()
    let ddl = await hre.ethers.getContract("DDL_ETH")
    let lockOption = await ddl.connect(deployer).lockOption(
        1570,
        {
            gasLimit: 1000000, gasPrice: 400000000,
        })
    console.log('lockOption', lockOption)
    return (await lockOption)
}

totalBalance()
// totalLocked()
// lockOption()
// approve()