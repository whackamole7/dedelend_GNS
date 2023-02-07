import { ethers } from "ethers"
import { DDL_ETH, DDL_ETH_signed, USDC, DDL_POOL, DDL_BTC, DDL_BTC_signed } from './contracts';
import { floor } from './math';


export const getGlobalStats = async () => {
	const globalStats = {}
	
	const totalBalance = (await DDL_POOL.getTotalBalance()).toNumber()
	
	const totalLocked = (await DDL_POOL.totalLocked()).toNumber()
	const totalSupplied = totalBalance + totalLocked;
	globalStats.totalSupplied = Math.round(ethers.utils.formatUnits(totalSupplied, 6));
	globalStats.availToBorrow = Math.round(ethers.utils.formatUnits(totalBalance, 6));
	globalStats.totalBorrowed = Math.round(ethers.utils.formatUnits(totalLocked, 6));
	
	globalStats.utilRate = floor(totalSupplied === 0 ? 
		0 : (totalLocked / totalSupplied * 100))
	globalStats.borrowAPY = 10;
	
	
	return globalStats;
}

export const getUserStats = async (walletAddress) => {
	try {
		const balance = Number(ethers.utils.formatUnits(await USDC.balanceOf(walletAddress), 6))
		const curBalance = Number(ethers.utils.formatUnits(await DDL_POOL.shareOf(walletAddress), 6))
	
		const totalBalance = (await DDL_POOL.getTotalBalance()).toNumber()
		const avail = Math.min(curBalance, totalBalance)
	
		const userStats = {
			balance: floor(balance),
			curBalance: floor(curBalance),
			avail: floor(avail),
		}
	
		return userStats;
	} catch(err) {
		console.log(err);
	}
	
}


export const getOptionStats = async (id, isETH) => {
	console.log('getting option stats', id);

	const contract = isETH ? DDL_ETH_signed : DDL_BTC_signed;
	
	const intrinsicValue = Number(ethers.utils.formatUnits(await contract.profitByOption(id), 6))
	const borrowLimit = Number(ethers.utils.formatUnits(await contract.maxBorrowLimit(id), 6))
	const borrowLimitUsed = Number(ethers.utils.formatUnits((await contract.borrowedByOption(id))[0], 6))
	const liqPrice = Number(borrowLimitUsed) === 0 ? '' : Number(ethers.utils.formatUnits(await contract.currentLiqPrice(id), 8))

	return {
		intrinsicValue: floor(intrinsicValue),
		borrowLimit: floor(borrowLimit),
		borrowLimitUsed: floor(borrowLimitUsed),
		liqPrice: (typeof liqPrice === 'string') ? liqPrice : floor(liqPrice),
		realVals: {
			intrinsicValue,
			borrowLimit,
			borrowLimitUsed,
			liqPrice,
		},
		contract,
	}
}
