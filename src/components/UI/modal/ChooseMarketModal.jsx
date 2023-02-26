import React, { useState } from 'react';
import Modal from './Modal';
import './ChooseMarketModal.scss';
import { useCallback, useEffect } from 'react';

const ChooseMarketModal = (props) => {
	const {
		visible,
		setVisible,
		marketsList,
		setMarkets,
		markets,
		getLiq,
	} = props;

	const [draftMarkets, setDraftMarkets] = useState(markets);

	return (
		<Modal
			className="ChooseMarket"
			visible={visible}
			setVisible={setVisible}
			resetModal={() => {
				setMarkets(draftMarkets);
			}}
		>
			<h1 className="ChooseMarket__title modal__title">
				Choose Markets
			</h1>
			<div className="ChooseMarket__items">
				{
					marketsList.map(market => {
						const icon = require(`../../../img/icon-${market.name}.svg`).default;
						const liqInfo = getLiq(market.name);
						console.log(liqInfo);

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
											defaultChecked={!!draftMarkets?.find((el) => el.name === market.name)}
											onChange={(e) => {
												if (e.target.checked) {
													draftMarkets.push(market);
												} else {
													const index = draftMarkets.findIndex(el => el.name === market.name);
													draftMarkets.splice(index, 1)
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
											${liqInfo.formattedValue}
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
					setMarkets(draftMarkets);
					setVisible(false);
				}}
			>
				Confirm market
			</button>
		</Modal>
	);
};

export default ChooseMarketModal;