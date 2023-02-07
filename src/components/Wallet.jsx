import React, { useState } from 'react';
import icon_wallet from '../img/icon-wallet.svg';
import icon_link from '../img/icon-link.svg';
import Button from './UI/button/Button';

const Wallet = ({ address, setAddress }) => {
	const [open, setOpen] = useState(false);

	function openWallet(e) {
		if (open) {
			closeWallet();
			return
		}
		
		e.stopPropagation();
		document.addEventListener('click', closeWallet);
		setOpen(true);
	}
	function closeWallet() {
		document.removeEventListener('click', closeWallet);
		setOpen(false);
	}


	function cutAddress(addr) {
		if (!addr) {
			return '';
		}
		
		return addr.slice(0, 9) + '...' + addr.slice(-15);
	}
	
	return (
		<div className={"wallet" + (open ? " active" : "")}>
			<button className="wallet__header" onClick={openWallet}>
				<div className="wallet__address">
					<img src={icon_wallet} alt="ETH" />
					<span>
						{cutAddress(address)}
					</span>
				</div>
			</button>
			<div className="wallet__body" onClick={(e) => e.stopPropagation()}>
				<button className="close-btn" onClick={closeWallet}>
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
						<g clipPath="url(#clip0_1830_494)">
							<path d="M10 0.875L9.125 0L5 4.125L0.875 0L0 0.875L4.125 5L0 9.125L0.875 10L5 5.875L9.125 10L10 9.125L5.875 5L10 0.875Z" fill="white"/>
						</g>
						<defs>
							<clipPath id="clip0_1830_494">
								<rect width="10" height="10" fill="white"/>
							</clipPath>
						</defs>
					</svg>
				</button>
				<a className="wallet__link" href={`https://arbiscan.io/address/${address}`} rel='noreferrer' target='_blank'>
					<img src={icon_link} alt="external link" />
					<span>View on Arbiscan</span>
				</a>
				<Button className="wallet__button" btnActive={true} onClick={() => {
					setAddress('');
				}}>
					Disconnect wallet
				</Button>
			</div>
		</div>
	);
};

export default Wallet;