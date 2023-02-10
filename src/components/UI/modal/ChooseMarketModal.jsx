import React, { useState } from 'react';
import Modal from './Modal';
import './ChooseMarketModal.scss';
import cx from 'classnames';

const ChooseMarketModal = (props) => {
	const {
		visible,
		setVisible,
		marketsList,
		setMarkets,
		markets,
	} = props;

	const [draftMarkets, setDraftMarkets] = useState(markets);

	return (
		<Modal
			className="ChooseMarket"
			visible={visible}
			setVisible={setVisible}
		>
			<h1 className="ChooseMarket__title modal__title">
				Choose Markets
			</h1>
			<div className="ChooseMarket__items">
				{
					marketsList.map(market => {
						const icon = require(`../../../img/icon-${market.name}.svg`).default;

						return (
							<div
								className="ChooseMarket__item App-box"
								key={market.name}
							>
								<div className="ChooseMarket__item-header">
									<div className="ChooseMarket__item-name">
										<img src={icon ?? ''} alt={market.name + " Icon"} />
										{market.name}
									</div>
									<div className="ChooseMarket__item-checkbox input-container">
										<input 
											type="checkbox" 
											defaultChecked={markets?.includes(market.name)} 
											onChange={(e) => {
												if (e.target.checked) {
													setDraftMarkets(cx(draftMarkets.trim(), market.name));
												} else {
													let result = draftMarkets.replace(market.name, '');

													setDraftMarkets(result);
												}
											}}
										/>
										<label />
									</div>
								</div>
								<div className="ChooseMarket__item-info text-table">
									<div className="text-table__row">
										<div className="text-table__left">
											Available Liquidity
										</div>
										<div className="text-table__right">
											{market.liq}
										</div>
									</div>
								</div>
							</div>
						)
					})
				}
			</div>
			<button 
				className="ChooseMarket__btn btn btn_hlight"
				onClick={() => {
					setMarkets(draftMarkets.trim());
					setVisible(false);
				}}
			>
				Confirm market
			</button>
		</Modal>
	);
};

export default ChooseMarketModal;