import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route,	useLocation, useNavigate } from "react-router-dom";
import BorrowMarket from '../views/markets/BorrowMarket';
import SupplyMarket from '../views/markets/SupplyMarket';
import Tabs from './Tabs';
import { DDL_POOL, USDC } from './utils/contracts';
import { UserStatsContext } from '../context/context';
import { ethers } from 'ethers';
import GMXInterface from '../views/gmx-test/App/App';
import { connectWallet } from './utils/wallet';
import MarginAccount from '../views/MarginAccount';


const AppRouter = ({ walletAddress, setWalletAddress, dgAddress, setRegisterVisible, account }) => {
	const loc = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (loc.pathname === '/' || loc.pathname === "/app.html") {
			navigate('/perpetuals');
		}
	}, [loc.pathname])


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
			{/* <Route
				path="/options"
				element={<BorrowMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} />} 
			/> */}
			<Route path="/perpetuals" element={
				<GMXInterface
					connectWallet={() => {
						connectWallet(setWalletAddress)
					}}
					walletAddress={walletAddress} 
					dgAddress={dgAddress}
					setRegisterVisible={setRegisterVisible} />
			} />
			<Route
				path="/earn"
				element={<SupplyMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} supplyStep={supplyStep} setSupplyStep={setSupplyStep} />} 
			/>
			<Route
				path="/account"
				element={
					<MarginAccount
						account={account}
					/>
				}
			/>
		</Routes>
	);
};

export default AppRouter;