import React, {useState} from 'react';
import icon_user from '../img/icon-user.svg';
import { cutAddress } from './utils/wallet';

const AccountDroplist = ({ accounts, account }) => {
	const [open, setOpen] = useState(false);

	function openAccounts(e) {
		if (open) {
			closeAccounts();
			return;
		}
		
		e.stopPropagation();
		document.addEventListener('click', closeAccounts);
		setOpen(true);
	}
	function closeAccounts() {
		document.removeEventListener('click', closeAccounts);
		setOpen(false);
	}
	
	const accountCut = cutAddress(account);
	
	
	return (
		<div className={"Account-droplist" + (open ? " active" : "")}>
			<button className="Account-droplist__header" onClick={openAccounts}>
				<img src={icon_user} alt="icon" />
				<span className='Account-droplist__address'>{accountCut}</span>
				<svg xmlns="http://www.w3.org/2000/svg" className='chevron-down' width="13" height="13" viewBox="0 0 13 13" fill="none">
					<path d="M2.60001 4.76667L7.10001 8.76667L11.6 4.76667" stroke="#747FA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			</button>
			<div className="Account-droplist__items" onClick={e => e.stopPropagation()}>
				{accounts?.map(acc => {
					return (
						<button className={"Account-droplist__item"} key={acc}>
							<div className={"Account-droplist__item-address" + (account === acc ? ' chosen' : '')}>
								{cutAddress(acc)}
							</div>
							<div className="Account-droplist__item-balance">
								$1,000
							</div>
						</button>
					)
				})}
				<button className='Account-droplist__btn btn_inline'>Create account</button>
			</div>
		</div>
	);
};

export default AccountDroplist;