import { ethers } from 'ethers';

const ARBITRUM = 42161;

export const requestAccount = async (setWalletAddress) => {
	if (window.ethereum) {
		try {
			if (window.ethereum.networkVersion && Number(window.ethereum.networkVersion) !== ARBITRUM) {
				alert('Change your network (Arbitrum) and reload the page')
				
				try {
					await window.ethereum.request({
						method: "wallet_switchEthereumChain",
						params: [{
							chainId: ethers.utils.hexlify(ARBITRUM)
						}]
					})

					window.location.reload()
				} catch(err) {
					console.log(err);

					if (err.code === 4902) {
						await window.ethereum.request({
							method: "wallet_addEthereumChain",
							params: [{
								chainId: ethers.utils.hexlify(ARBITRUM),
								chainName: 'Arbitrum One',
								nativeCurrency: {
									symbol: 'ETH',
									decimals: 18
								},
								rpcUrls: ['https://arb1.arbitrum.io/rpc'],
								blockExplorerUrls: ['https://arbiscan.io/']
							}]
						})

						window.location.reload()
					}
				}

				return;
			}

			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			
			setWalletAddress(accounts[0])

			window.ethereum.on('accountsChanged', (accounts) => {
				setWalletAddress(accounts[0])
			})
		} catch(e) {
			console.log(e);
		}
		
	} else {
		alert('Please, install MetaMask extension to use this application.');
	}
}

export const connectWallet = async (setWalletAddress) => {
	await requestAccount(setWalletAddress);
}


export const cutAddress = (addr, isAdaptive = true) => {
	if (!addr) {
		return '';
	}

	if (isAdaptive && window.outerWidth <= 480) {
		return addr.slice(0, 3) + '...' + addr.slice(-3);
	}
	
	return addr.slice(0, 10) + '...' + addr.slice(-5);
}