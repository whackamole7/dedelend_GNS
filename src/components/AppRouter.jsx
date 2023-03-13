import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import BorrowMarket from '../views/markets/BorrowMarket';
import SupplyMarket from '../views/markets/SupplyMarket';
import Tabs from './Tabs';
import { DDL_POOL, USDC } from './utils/contracts';
import { UserStatsContext } from '../context/context';
import { ethers } from 'ethers';
import GMXInterface from '../views/gmx-test/App/App';
import { connectWallet } from './utils/wallet';
import { HOMEPAGE_HREF } from './utils/constants';


const AppRouter = ({ walletAddress, setWalletAddress, setRegisterVisible, account }) => {
	// Supply Market state
	const {userStats} = useContext(UserStatsContext)
	const [supplyStep, setSupplyStep] = useState(0)

	useEffect(() => {
		if (walletAddress) {
			USDC.allowance(walletAddress, DDL_POOL.address)
				.then((res) => {
					if (Number(ethers.utils.formatUnits(res, 6)) >= userStats.balance) {
						setSupplyStep(1)
					} else {
						setSupplyStep(0)
					}
			})
		}
	}, [userStats.balance, walletAddress])

	
	return (
		<Routes>
			<Route path="/perpetuals" element={
				<GMXInterface
					connectWallet={() => {
						connectWallet(setWalletAddress)
					}}
					walletAddress={walletAddress} 
					setRegisterVisible={setRegisterVisible} />
			} />
			<Route path="/options" element={
				<GMXInterface
					connectWallet={() => {
						connectWallet(setWalletAddress)
					}}
					walletAddress={walletAddress} 
					setRegisterVisible={setRegisterVisible} />
			} />
			<Route
				path="*"
				element={<Navigate to={HOMEPAGE_HREF} replace />}
			/>
		</Routes>
	);
};

export default AppRouter;