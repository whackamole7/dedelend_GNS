import React from 'react';
import Currency from './../components/Currency';
import Button from './../components/UI/button/Button';
import icon_ETH from '../img/icon-ETH.svg';
import icon_WBTC from '../img/icon-WBTC.svg';
import icon_link from '../img/icon-link.svg';
import icon_repay from '../img/icon-repay.svg';
import icon_wallet from '../img/icon-wallet.svg';
import icon_dollar from '../img/icon-dollar.svg';
import { cutAddress } from './../components/utils/wallet';
import MarginLevel from './../components/MarginLevel';
import Tooltip from './gmx-test/components/Tooltip/Tooltip';

const MarginAccount = (props) => {
	const {
		account
	} = props;

	return (
		(account &&
			<div className="MarginAccount block">
				<div className="MarginAccount__header">
					<h1 className="MarginAccount__title block__title">Margin Account info</h1>
					<a className="MarginAccount__account-link" href={`https://arbiscan.io/address/${account}`} rel='noreferrer' target='_blank'>
						<img src={icon_link} alt="Link icon" />
						{cutAddress(account, false)}
					</a>
				</div>
				<div className="MarginAccount__sections">
					{/* USDC */}
					<div className="MarginAccount__section App-box">
						<div className="MarginAccount__section-title">Available</div>
						<div className="MarginAccount__section-value">
							<div className="MarginAccount__section-value_major">
								<Currency>2000.15</Currency>
							</div>
							<div className="MarginAccount__section-value_minor">
								$2000,15
							</div>
							<div className="MarginAccount__section-value_minor MarginAccount__section-price">
								<span className='muted_light nowrap'>Current price:</span>
								$1
							</div>
						</div>
						<div className="MarginAccount__section-btns btns">
							<Button className={'btn_hlight'}>Deposit</Button>
							<Button className={'btn_stroke'}>Withdraw</Button>
						</div>
					</div>
					{/* USDC end */}

					<div className="MarginAccount__section App-box coming-soon">
						<div className="coming-soon__text">
							<img src={icon_WBTC} alt="Wrapped Bitcoin icon" />
						</div>
					</div>
					<div className="MarginAccount__section App-box coming-soon">
						<div className="coming-soon__text">
							<img src={icon_ETH} alt="Ethereum icon" />
						</div>
					</div>

					<MarginLevel className="MarginAccount__section">
						<div className="divider" />
						<div className="text-table">
							<div className="text-table__row">
								<div className="text-table__left">Borrow APY</div>
								<div className="text-table__right muted_light">5%</div>
							</div>
						</div>
					</MarginLevel>

					<div className="MarginAccount__section MarginAccount__section_complex App-box">
						<div className="MarginAccount__section-child App-box">
							<div className="MarginAccount__section-icon">
								<img src={icon_wallet} alt="Wallet icon" />
							</div>
							<div className="MarginAccount__section-title">
								<Tooltip
									className="has-hint-tooltip nowrap"
									id="margin-balance-tooltip"
									handle="Margin Balance"
									position="left-bottom"
									enabled={true}
									renderContent={() => {
										return (
											<div>
												Margin Balance = Account Balance + <br />Unrealized PnL. Your margin account <br />will be liquidated once Margin Balance <br />less or equal min. Maintain margin
											</div>
										);
									}}
								/>
							</div>
							<div className="MarginAccount__section-value">$100,000</div>
							<div className="MarginAccount__section-table text-table text-table_small">
								<div className="text-table__row">
									<div className="text-table__left">
										<Tooltip
											className="has-hint-tooltip nowrap"
											id="account-balance-tooltip"
											handle="Account Balance"
											position="left-bottom"
											enabled={true}
											renderContent={() => {
												return (
													<div>
														The value of your assets in USDC
													</div>
												);
											}}
										/>
									</div>
									<div className="text-table__right">$99,500</div>
								</div>
								<div className="text-table__row">
									<div className="text-table__left">Unrealized PnL</div>
									<div className="text-table__right">$500</div>
								</div>
							</div>
						</div>
						<div className="MarginAccount__section-child App-box">
							<div className="MarginAccount__section-icon">
								<img src={icon_dollar} alt="Dollar Icon" />
							</div>
							<div className="MarginAccount__section-title">
								<Tooltip
									className="has-hint-tooltip nowrap"
									id="debt-tooltip"
									handle="Debt"
									position="left-bottom"
									enabled={true}
									renderContent={() => {
										return (
											<div>
												The total amount of USDC <br />loaned to you margin account <br />+ Interest fee + Service fee
											</div>
										);
									}}
								/>
							</div>
							<div className="MarginAccount__section-value">
								<div className="MarginAccount__section-value_major">
									<Currency>20000</Currency>
								</div>
								<div className="MarginAccount__section-btn">
									<button className="btn_inline">
										<img className="btn__icon" src={icon_repay} alt="Repay icon" />
										Repay
									</button>
								</div>
							</div>
							<div className="MarginAccount__section-table text-table text-table_small">
								<div className="text-table__row">
									<div className="text-table__left">Debt</div>
									<div className="text-table__right">
										<Currency>19950</Currency>
									</div>
								</div>
								<div className="text-table__row">
									<div className="text-table__left">Interest & Service Fee</div>
									<div className="text-table__right">
										<Currency>50</Currency>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>)
	);
};

export default MarginAccount;