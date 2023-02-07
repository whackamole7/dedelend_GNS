import React, { useContext, useEffect, useState } from 'react';
import Logo from './components/UI/logo/Logo'
import Button from './components/UI/button/Button';
import Wallet from './components/Wallet';
import { GlobalStatsContext, UserStatsContext } from './context/context';
import { ethers } from 'ethers';
import { connectWallet } from './components/utils/wallet';
import HegicStrategyATM_CALL_ETH from "./deployments/arbitrum_ddl/HegicStrategyATM_CALL_ETH.json";
import HegicStrategyOTM_CALL_110_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_110_ETH.json";
import HegicStrategyOTM_CALL_120_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_120_ETH.json";
import HegicStrategyOTM_CALL_130_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_130_ETH.json";
import HegicStrategyATM_CALL_BTC from "./deployments/arbitrum_ddl/HegicStrategyATM_CALL_BTC.json";
import HegicStrategyOTM_CALL_110_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_110_BTC.json";
import HegicStrategyOTM_CALL_120_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_120_BTC.json";
import HegicStrategyOTM_CALL_130_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_CALL_130_BTC.json";
import HegicStrategyATM_PUT_ETH from "./deployments/arbitrum_ddl/HegicStrategyATM_PUT_ETH.json";
import HegicStrategyOTM_PUT_70_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_70_ETH.json";
import HegicStrategyOTM_PUT_80_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_80_ETH.json";
import HegicStrategyOTM_PUT_90_ETH from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_90_ETH.json";
import HegicStrategyATM_PUT_BTC from "./deployments/arbitrum_ddl/HegicStrategyATM_PUT_BTC.json";
import HegicStrategyOTM_PUT_70_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_70_BTC.json";
import HegicStrategyOTM_PUT_80_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_80_BTC.json";
import HegicStrategyOTM_PUT_90_BTC from "./deployments/arbitrum_ddl/HegicStrategyOTM_PUT_90_BTC.json";
import OptionsManager from "./deployments/arbitrum_ddl/OptionsManager.json";
import HegicOperationalTreasury from "./deployments/arbitrum_ddl/HegicOperationalTreasury.json";
import {mmProvider} from './components/utils/providers.js'
import { OptManager, PriceProviderETH, PriceProviderBTC, DDL_AccountManager, getDgContract } from './components/utils/contracts';
import { getGlobalStats, getUserStats, getOptionStats } from './components/utils/stats';
import { useLocation } from 'react-router-dom';
import Tabs from './components/Tabs';
import RegisterModal from './components/UI/modal/RegisterModal';
import { errAlert } from './components/utils/notifications';
import AccountDroplist from './components/AccountDroplist';


const Header = (props) => {
	const {
		walletAddress, 
		setWalletAddress, 
		account,
		setAccount,
		accounts,
		registerVisible,
		setRegisterVisible
	} = props;

	const { setGlobalStats } = useContext(GlobalStatsContext)
	const { setUserStats } = useContext(UserStatsContext)
	
	const [registerStep, setRegisterStep] = useState(0);
	const [registerLoading, setRegisterLoading] = useState(false);
	const [depositVal, setDepositVal] = useState('');
	
	async function register() {
		setRegisterLoading(true);
	}

	async function approveAll() {
		
	}
	
	async function getOptionByUser(userAddress) {
		let hot = OptManager;

		let hegicOperationalTreasury = new ethers.Contract(HegicOperationalTreasury.address, HegicOperationalTreasury.abi, mmProvider)
		const iface = new ethers.utils.Interface(OptionsManager.abi)
	
		const strategyMap = new Map([
			[HegicStrategyATM_CALL_ETH.address, { "name": "ETH-ATM-CALL", "inf": HegicStrategyATM_CALL_ETH }],
			[HegicStrategyOTM_CALL_110_ETH.address, { "name": "ETH-OTM-CALL-10%", "inf": HegicStrategyOTM_CALL_110_ETH }],
			[HegicStrategyOTM_CALL_120_ETH.address, { "name": "ETH-OTM-CALL-20%", "inf": HegicStrategyOTM_CALL_120_ETH }],
			[HegicStrategyOTM_CALL_130_ETH.address, { "name": "ETH-OTM-CALL-30%", "inf": HegicStrategyOTM_CALL_130_ETH }],
			[HegicStrategyATM_CALL_BTC.address, { "name": "BTC-ATM-CALL", "inf": HegicStrategyATM_CALL_BTC }],
			[HegicStrategyOTM_CALL_110_BTC.address, { "name": "BTC-OTM-CALL-10%", "inf": HegicStrategyOTM_CALL_110_BTC }],
			[HegicStrategyOTM_CALL_120_BTC.address, { "name": "BTC-OTM-CALL-20%", "inf": HegicStrategyOTM_CALL_120_BTC }],
			[HegicStrategyOTM_CALL_130_BTC.address, { "name": "BTC-OTM-CALL-30%", "inf": HegicStrategyOTM_CALL_130_BTC }],
			[HegicStrategyATM_PUT_ETH.address, { "name": "ETH-ATM-PUT", "inf": HegicStrategyATM_PUT_ETH }],
			[HegicStrategyOTM_PUT_70_ETH.address, { "name": "ETH-OTM-PUT-30%", "inf": HegicStrategyOTM_PUT_70_ETH }],
			[HegicStrategyOTM_PUT_80_ETH.address, { "name": "ETH-OTM-PUT-20%", "inf": HegicStrategyOTM_PUT_80_ETH }],
			[HegicStrategyOTM_PUT_90_ETH.address, { "name": "ETH-OTM-PUT-10%", "inf": HegicStrategyOTM_PUT_90_ETH }],
			[HegicStrategyATM_PUT_BTC.address, { "name": "BTC-ATM-PUT", "inf": HegicStrategyATM_PUT_BTC }],
			[HegicStrategyOTM_PUT_70_BTC.address, { "name": "BTC-OTM-PUT-30%", "inf": HegicStrategyOTM_PUT_70_BTC }],
			[HegicStrategyOTM_PUT_80_BTC.address, { "name": "BTC-OTM-PUT-20%", "inf": HegicStrategyOTM_PUT_80_BTC }],
			[HegicStrategyOTM_PUT_90_BTC.address, { "name": "BTC-OTM-PUT-10%", "inf": HegicStrategyOTM_PUT_90_BTC }],
		])
	
		let transferTopics = iface.encodeFilterTopics("Transfer", [
			null,
			userAddress
			])
		let transferLogs = await mmProvider.getLogs({
			"address":hot.address,
			"fromBlock": 6661745 , 
			"topics": transferTopics
		})
	
		let arrObj = []
		let ids = []
		
		for (let event of transferLogs) {
			
			let decodeData = iface.decodeEventLog("Transfer", event.data, event.topics)
			
			let lockL = await hegicOperationalTreasury.lockedLiquidity(decodeData.tokenId)
			
			if (Number(lockL.state) !== 0) {
				const id = decodeData.tokenId.toNumber()
				if (ids.includes(id)) {
					continue;
				}

				let expiration = lockL.expiration * 1000 - Date.now();
				if (expiration <= 0) {
					continue;
				}
				
				let strategyInf = strategyMap.get(lockL.strategy);
				if (!strategyInf) {
					continue;
				}

				ids.push(id)
				
				const HegicStrategy = new ethers.Contract(lockL.strategy, strategyInf.inf.abi, mmProvider)
				
				let strategyData = await HegicStrategy.strategyData(id)
				let isETH = strategyInf.name?.includes("ETH")
				let amount = Number(ethers.utils.formatUnits(strategyData.amount.toString(),isETH ? 18 :8))
				let strike = Number(ethers.utils.formatUnits(strategyData.strike.toString(),8))
				
				
				const res = await getOptionStats(id, isETH)
				
				const isCALL = strategyInf.name?.includes("CALL");
				const PriceProvider = isETH ? PriceProviderETH : PriceProviderBTC
				const curPrice = Number(ethers.utils.formatUnits(
					(await PriceProvider.latestRoundData())[1], 8
				))
				
				const diff = isETH ? 0.04 : 0.03;
				let priorLiqPrice;
				if (isCALL) {
					priorLiqPrice = strike * (1 + diff);

					if (curPrice <= priorLiqPrice) {
						res.borrowLimit = 0;
					}
				} else {
					priorLiqPrice = strike * (1 - diff)
					
					if (curPrice >= priorLiqPrice) {
						res.borrowLimit = 0;
					}
				}
				
				
				arrObj.push({
					id,
					name: strategyInf.name,
					amount: Math.floor(amount * 100)/100,
					strike: Math.floor(strike * 100)/100,
					expiration,
					// strategy: lockL.strategy,
					intrinsicValue: res.intrinsicValue,
					borrowLimit: res.borrowLimit,
					borrowLimitUsed: res.borrowLimitUsed,
					liqPrice: res.liqPrice ?? '',
					realVals: res.realVals ?? {},
					contract: res.contract,
					isETH,
					priorLiqPrice
				})
			}
		}
		

		if (!arrObj.length) {
			arrObj.push('You don’t have active Hegic Options')
		}
		return arrObj;
	};

	useEffect(() => {
		connectWallet(setWalletAddress)

		getGlobalStats()
			.then(stats => {
				setGlobalStats(stats)
			})
	}, [window.ethereum?.networkVersion])

	useEffect(() => {
		if (walletAddress) {
			getUserStats(walletAddress)
				.then(stats => {
					setUserStats(stats)

					getOptionByUser(walletAddress)
						.then(options => {
							setUserStats({
								...stats,
								options
							})
						})
				})
		}
	}, [walletAddress])


	const loc = useLocation();
	const headerLinks = [
		/* {
			name: 'Options',
			to: '/options',
		}, */
		{
			name: 'Perpetuals',
			to: '/perpetuals',
		},
		{
			name: 'Earn',
			to: '/earn',
		},
		{
			name: 'Margin Account',
			to: '/account',
			isHidden: !account,
		},
		{
			name: 'Old Version',
			to: 'https://old.dedelend.co/',
			isExternal: true,
		},
	]
	headerLinks.find(link => {
		link.isActive = loc.pathname.split('/')[1] === link.to.split('/')[1];
		return link.isActive;
	})

	return (
		<header className='header'>
			<div className="header__content _container">
				<div className="header__nav">
					<Logo />
					<Tabs className='header__links' links={headerLinks} />
				</div>

				<div className="Account-data">
					{walletAddress ?
						<>
							{account ? 
								<AccountDroplist
									accounts={accounts}
									account={account} />
								:
								<div className="account-btn-wrapper">
									<Button className='account-btn' isMain={true} onClick={(e) => {
										setAccount('0x0641bc55DDAb3b9636e82CbF87EDE3c3c533039d')
									}}>
										{window.outerWidth > 480 ?
										'Create Margin Account      '
										: 'Create Account      '}
									</Button>
								</div>
								}
							<Wallet address={walletAddress} 
								setAddress={setWalletAddress}
							/>
						</>
						:
						<Button isMain={true} onClick={(e) => {
							connectWallet(setWalletAddress)
						}}>Connect wallet</Button>}
				</div>

				{loc.pathname.startsWith('/perpetuals') && (
					<RegisterModal
						visible={registerVisible}
						setVisible={setRegisterVisible}
						onRegisterClick={register}
						onApproveClick={approveAll}
						curStep={registerStep}
						isLoading={registerLoading}
						depositVal={depositVal}
						setDepositVal={setDepositVal}
						 />
				)}
				
			</div>
		</header>
	);
};

export default Header;