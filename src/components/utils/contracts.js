import { ethers } from 'ethers';
import _DDL_ETH from '../../deployments/arbitrum_ddl/DDL_ETH.json'
import _DDL_BTC from '../../deployments/arbitrum_ddl/DDL_BTC.json'
import _DDL_POOL from '../../deployments/arbitrum_ddl/DDL_POOL.json'
import _OptManager from "../../deployments/arbitrum_ddl/OptionsManager.json";
import _USDC from "../../deployments/arbitrum_ddl/USDC.json";
import _PriceProviderETH from "../../deployments/arbitrum_ddl/PriceProviderETH.json";
import _PriceProviderBTC from "../../deployments/arbitrum_ddl/PriceProviderBTC.json";
import {netProvider, mmProvider, signer} from './providers.js'

import _AccountManager from "../../deployments/arbitrum_ddl/accountManager.json";
import _AccountManagerToken from "../../deployments/arbitrum_ddl/accountManagerToken.json";
import _Doppelganger from "../../deployments/arbitrum_ddl/Doppelganger.json";
import _DDL_GMX from "../../deployments/arbitrum_ddl/DDL_GMX.json";

import _Vault from "../../deployments/arbitrum_ddl/vault.json";
import _WETH from "../../deployments/arbitrum_ddl/WETH.json";

// Options Contracts
export const DDL_ETH = new ethers.Contract(_DDL_ETH.address, _DDL_ETH.abi, mmProvider ?? netProvider);
export const DDL_ETH_signed = DDL_ETH.connect(signer);

export const DDL_BTC = new ethers.Contract(_DDL_BTC.address, _DDL_BTC.abi, mmProvider ?? netProvider);
export const DDL_BTC_signed = DDL_BTC.connect(signer)

export const DDL_POOL = new ethers.Contract(_DDL_POOL.address, _DDL_POOL.abi, mmProvider ?? netProvider);
export const DDL_POOL_signed = DDL_POOL.connect(signer)

export const OptManager = new ethers.Contract(_OptManager.address, _OptManager.abi, signer)

export const USDC = new ethers.Contract(_USDC.address, _USDC.abi, mmProvider ?? netProvider)
export const USDC_signed = USDC.connect(signer)

export const PriceProviderETH = new ethers.Contract(_PriceProviderETH.address, _PriceProviderETH.abi, mmProvider ?? netProvider)

export const PriceProviderBTC = new ethers.Contract(_PriceProviderBTC.address, _PriceProviderBTC.abi, mmProvider ?? netProvider)


// GMX Contracts
export const DDL_AccountManager = new ethers.Contract(_AccountManager.address, _AccountManager.abi, signer);
export const DDL_AccountManager_abi = _AccountManager.abi;

export const DDL_AccountManagerToken = new ethers.Contract(_AccountManagerToken.address, _AccountManagerToken.abi, signer);

export const DDL_GMX = new ethers.Contract(_DDL_GMX.address, _DDL_GMX.abi, signer);

export const Vault = new ethers.Contract(_Vault.address, _Vault.abi, signer);
export const WETH_address = _WETH.address;


export function getDgContract(dgAddress) {
	const contract = new ethers.Contract(dgAddress, _Doppelganger.abi, signer);
	return contract;
}
