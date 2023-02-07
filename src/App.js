// Style
import './style/App.scss'

// Main
import React, { useState, useEffect } from 'react';

import Header from './Header';
import Footer from './Footer';
import AppRouter from './components/AppRouter';
import { HashRouter } from 'react-router-dom';
import { UserStatsContext } from './context/context';
import { GlobalStatsContext } from './context/context';
import Warning from './components/UI/warning/Warning';
import { ToastContainer } from 'react-toastify';
import { cssTransition } from 'react-toastify';
import EventToastContainer from './views/gmx-test/components/EventToast/EventToastContainer';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { defaultLocale, dynamicActivate } from './views/gmx-test/lib/i18n';
import { LANGUAGE_LOCALSTORAGE_KEY } from './views/gmx-test/lib/legacy';



function App() {
	const [walletAddress, setWalletAddress] = useState('');
	const [dgAddress, setDgAddress] = useState('');
	const [account, setAccount] = useState('');
	const [accounts, setAccounts] = useState([
		'0x0641bc55ddab3b9636e82cbf87ede3c3c533039d',
		'0x0641bc55ddab3b9636e82cbf87ede3c3c5330000'
	])
	const [registerVisible, setRegisterVisible] = useState(false);
	
	const [userStats, setUserStats] = useState({
		balance: undefined,
		curBalance: undefined,
		avail: undefined
	})
	const [globalStats, setGlobalStats] = useState(
		{
			totalSupplied: "",
			totalBorrowed: "",
			utilRate: "",
			availToBorrow: "",
			borrowAPY: "",
		}
	)

	const Jelly = cssTransition({
		enter: "jellyIn",
		exit: "jellyOut",
	});

	useEffect(() => {
    const defaultLanguage = localStorage.getItem(LANGUAGE_LOCALSTORAGE_KEY) || defaultLocale;
    dynamicActivate(defaultLanguage);
  }, []);
	
	return (
		<>
			{/* <Favicon url="https://i.imgur.com/dLCWse0.png" /> */}
			<GlobalStatsContext.Provider value={{
				globalStats,
				setGlobalStats
			}}>
				<UserStatsContext.Provider value={{
					userStats,
					setUserStats
				}}>
					<HashRouter>
						<I18nProvider i18n={i18n}>
							<ToastContainer
								limit={1}
								transition={Jelly}
								position="bottom-right"
								// autoClose={}
								hideProgressBar={true}
								newestOnTop={false}
								closeOnClick={false}
								draggable={false}
								pauseOnHover={false}
							/>
							<EventToastContainer />
							<div className="App">
								<Header walletAddress={walletAddress}
									setWalletAddress={setWalletAddress}
									accounts={accounts}
									account={account}
									setAccount={setAccount}
									registerVisible={registerVisible}
									setRegisterVisible={setRegisterVisible}
								/>

								<main className='_container'>
									<AppRouter
										walletAddress={walletAddress}
										setWalletAddress={setWalletAddress} 
										account={account}
										setAccount={setAccount}
										dgAddress={dgAddress}
										setDgAddress={setDgAddress}
										setRegisterVisible={setRegisterVisible}
									/>
								</main>

								<Footer />
							</div>
						</I18nProvider>
					</HashRouter>
					
				</UserStatsContext.Provider>
			</GlobalStatsContext.Provider>
			<Warning>
				DeDeLend is in beta. Use at your own risk
			</Warning>
		</>
	);
}

export default App;
