import React, { useState } from 'react';
import Tooltip from './../Tooltip/Tooltip';
import { formatAmount } from '../../lib/legacy';
import { ImSpinner2 } from 'react-icons/im';
import { t } from '@lingui/macro';
import { USD_DECIMALS, INCREASE, STOP } from './../../lib/legacy';
import StatsTooltipRow from '../StatsTooltip/StatsTooltipRow';
import { Trans } from '@lingui/macro';
import './PositionsItem.scss';
import icon_edit from '../../../../img/icon-edit.svg';

const PositionsItem = (props) => {
	const {
		position,
		onPositionClick,
		setListSection,
		positionOrders,
		showPnlAfterFees,
		hasPositionProfit,
		positionDelta,
		hasOrderError,
		liquidationPrice,
		cx,
		borrowFeeUSD,
		editPosition,
		sellPosition,
		isLarge,
		isPending,
		openSLTPModal,
	} = props;

	const [isCloseLoading, setIsCloseLoading] = useState(false);

	const marketImg = require(`../../../../img/icon-${position.market}.svg`).default;

	if (position.market === 'GNS') {
		position.hasPendingChanges = isPending;
	}

	const openOrderModal = (market, isTP, position) => {
		if (market === 'GNS') {
			openSLTPModal(isTP, position);
		}
		if (market === 'GMX') {
			const orderName = isTP ? 'TP' : 'SL';
			if (triggerPricesGMX[orderName]) {
				setListSection && setListSection("Orders");
			} else {
				sellPosition(position, setIsCloseLoading, STOP);
			}
			
		}
	}

	const triggerOrdersGMX = positionOrders?.filter(order => {
		return order.type === 'Decrease';
	});
	const triggerPricesGMX = {
		SL: undefined,
		TP: undefined,
	}
	triggerOrdersGMX.map(order => {
		const price = order.triggerPrice;

		if (position.isLong) {
			if (price.gt(position.averagePrice)) {
				triggerPricesGMX.TP = price;
			} else if (price.lt(position.averagePrice)) {
				triggerPricesGMX.SL = price;
			}
		} else {
			if (price.gt(position.averagePrice)) {
				triggerPricesGMX.SL = price;
			} else if (price.lt(position.averagePrice)) {
				triggerPricesGMX.TP = price;
			}
		}
	})
	
	return (
		<>
			{isLarge ?
				<tr>
					<td className="clickable" onClick={() => onPositionClick(position)}>
						<div className="Exchange-list-title">
							{position.indexToken.symbol}
							{position.hasPendingChanges && <ImSpinner2 className="spin position-loading-icon" />}
						</div>
						<div className="Exchange-list-info-label">
							<img className='market-logo' src={marketImg} alt={`${position.market} icon`} />
							{position.leverage && (
								<span className="muted">{formatAmount(position.leverage, 4, 2, true)}x&nbsp;</span>
							)}
							<span className={cx({ positive: position.isLong, negative: !position.isLong })}>
								{position.isLong ? "Long" : "Short"}
							</span>
						</div>
					</td>
					<td>
						<div>${formatAmount(position.size, USD_DECIMALS, 2, true)}</div>
						{positionOrders?.length > 0 && (
							<div onClick={() => setListSection && setListSection("Orders")}>
								<Tooltip
									handle={`Orders (${positionOrders.length})`}
									position="left-bottom"
									handleClassName={cx(
										["Exchange-list-info-label", "Exchange-position-list-orders", "plain", "clickable"],
										{ muted: !hasOrderError, negative: hasOrderError }
									)}
									renderContent={() => {
										return (
											<>
												<strong>Active Orders</strong>
												{positionOrders.map((order) => {
													return (
														<div
															key={`${order.isLong}-${order.type}-${order.index}`}
															className="Position-list-order"
														>
															{order.triggerAboveThreshold ? ">" : "<"}{" "}
															{formatAmount(order.triggerPrice, 30, 2, true)}:
															{order.type === INCREASE ? " +" : " -"}${formatAmount(order.sizeDelta, 30, 2, true)}
															{order.error && (
																<>
																	, <span className="negative">{order.error}</span>
																</>
															)}
														</div>
													);
												})}
											</>
										);
									}}
								/>
							</div>
						)}
					</td>
					<td>
						<Tooltip
							handle={`$${formatAmount(position.collateral, USD_DECIMALS, 2, true)}`}
							position="left-bottom"
							handleClassName={cx("plain", { negative: position.hasLowCollateral })}
							renderContent={() => {
								return (
									<>
										{position.hasLowCollateral && (
											<div>
												<Trans>
													WARNING: This position has a low amount of collateral after deducting borrowing fees,
													deposit more collateral to reduce the position's liquidation risk.
												</Trans>
												<br />
												<br />
											</div>
										)}

										<StatsTooltipRow
											label={t`Initial Collateral`}
											value={formatAmount(position.collateral, USD_DECIMALS, 2, true)}
										/>
										<StatsTooltipRow
											label={t`Borrow Fee`}
											value={formatAmount(position.fundingFee, USD_DECIMALS, 2, true)}
										/>
										<StatsTooltipRow label={t`Borrow Fee / Day`} value={borrowFeeUSD} />
										<br />
										<Trans>Use the "Edit" button to deposit or withdraw collateral.</Trans>
									</>
								);
							}}
						/>
						{position.market === 'GMX' && (
							<button
								className='edit-btn'
								onClick={() => {
									editPosition(position);
								}}
							>
								<img src={icon_edit} alt="Edit position button" />
							</button>
						)}
					</td>
					<td onClick={() => {
						// onPositionClick(position)
						return;
					}} style={{width: 135}}>
						{`$${formatAmount(position.markPrice, USD_DECIMALS, 2, true)}`}
					</td>
					<td className="" onClick={() => {
						// onPositionClick(position)
						return;
					}}>
						{`$${formatAmount(position.averagePrice, USD_DECIMALS, 2, true)}`}
					</td>
					<td className="" onClick={() => {
						// onPositionClick(position)
						return;
					}}>
						{`$${formatAmount(liquidationPrice, USD_DECIMALS, 2, true)}`}
					</td>
					<td>
						<div style={{ width: 100, display: 'block' }}>
							{position.deltaStr && (
								<div
									className={cx("Exchange-list-info-label", {
										positive: hasPositionProfit && positionDelta.gt(0),
										negative: !hasPositionProfit && positionDelta.gt(0),
										muted: positionDelta.eq(0),
									})}
								>
									{position.deltaAfterFeesStr ?? position.deltaStr} ({position.deltaAfterFeesPercentageStr ?? position.deltaPercentageStr})
								</div>
							)}
						</div>
						
					</td>
					<td>
						{position.market === 'GNS' && position.sl &&
							(
								!position.sl?.eq(0) &&
									('$' + formatAmount(position.sl, 10, 2, true))
							)
						}
						{position.market === 'GMX' && (triggerPricesGMX.SL 
							? ('$' + formatAmount(triggerPricesGMX.SL, USD_DECIMALS, 2, true))
							: '')
						}
						<button
							className="Exchange-list-action"
							onClick={() => openOrderModal(position.market, false, position)}
							disabled={!position.size || isPending}
						>
							{((!position.sl || position.sl?.eq(0)) && !triggerPricesGMX.SL)
								? 'Set SL'
								: <img src={icon_edit} alt="Edit Stop Loss button" />}
						</button>
					</td>
					<td>
						{position.market === 'GNS' && position.tp &&
							(
								!position.tp?.eq(0) &&
									('$' + formatAmount(position.tp, 10, 2, true))
							)
						}
						{position.market === 'GMX' && (triggerPricesGMX.TP 
							? ('$' + formatAmount(triggerPricesGMX.TP, USD_DECIMALS, 2, true))
							: '')
						}
						<button
							className="Exchange-list-action"
							onClick={() => openOrderModal(position.market, true, position)}
							disabled={!position.size || isPending}
						>
							{((!position.tp || position.tp?.eq(0)) && !triggerPricesGMX.TP)
								? 'Set TP'
								: <img src={icon_edit} alt="Edit Take Profit button" />}
						</button>
					</td>
					<td className="td-btn pos-relative">
						{
							isCloseLoading ?
								<ImSpinner2 className="spin position-loading-icon" />
								:
								!isPending &&
									<button
										className="Exchange-list-action"
										onClick={() => {
											setIsCloseLoading(true);
											sellPosition(position, setIsCloseLoading);
										}}
										disabled={position.size.eq(0)}
									>
										Close
									</button>
						}
					</td>
				</tr>
			:
			<div className="App-card">
				<div className="App-card-divider"></div>
				<div className="App-card-content">
					<div className="App-card-row">
						<div className="label">
							<Trans>Position</Trans>
						</div>
						<div>
							<div className="Exchange-list-token">
								{position.hasPendingChanges && <ImSpinner2 className="spin position-loading-icon" style={{marginRight: 10}} />}
								{position.indexToken.symbol}
								</div>
							<img className='market-logo' src={marketImg} alt={`${position.market} icon`} />
							<span
								className={cx("Exchange-list-side", {
									positive: position.isLong,
									negative: !position.isLong,
								})}
							><span className="Exchange-list-leverage">{formatAmount(position.leverage, 4, 2, true)}x&nbsp;</span>
								{position.isLong ? t`Long` : t`Short`}
							</span>
						</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							Size
						</div>
						<div>${formatAmount(position.size, USD_DECIMALS, 2, true)}</div>
					</div>
					
				</div>
				<div className="App-card-divider"></div>
				<div className="App-card-content">
					<div className="App-card-row">
						<div className="label">
							<Trans>Mark Price</Trans>
						</div>
						<div>${formatAmount(position.markPrice, USD_DECIMALS, 2, true)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							<Trans>Entry Price</Trans>
						</div>
						<div>${formatAmount(position.averagePrice, USD_DECIMALS, 2, true)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							<Trans>Liq. Price</Trans>
						</div>
						<div>${formatAmount(liquidationPrice, USD_DECIMALS, 2, true)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							PNL (ROE %)
						</div>
						<div>
							{position.deltaStr && (
								<div
									className={cx("Exchange-list-info-label", {
										positive: hasPositionProfit && positionDelta.gt(0),
										negative: !hasPositionProfit && positionDelta.gt(0),
										muted: positionDelta.eq(0),
									})}
								>
									{position.deltaAfterFeesStr ?? position.deltaStr} ({position.deltaAfterFeesPercentageStr ?? position.deltaPercentageStr})
								</div>
							)}
						</div>
					</div>
					<div className="App-card-row App-card-row_edit-btn">
						<div className="label">
							Stop Loss
						</div>
						<div>
							{position.market === 'GNS' && position.sl &&
								(
									!position.sl?.eq(0) &&
										('$' + formatAmount(position.sl, 10, 2, true))
								)
							}
							{position.market === 'GMX' && (triggerPricesGMX.SL 
								? ('$' + formatAmount(triggerPricesGMX.SL, USD_DECIMALS, 2, true))
								: '')
							}
						</div>
						<button
							className="Exchange-list-action"
							onClick={() => openOrderModal(position.market, false, position)}
							disabled={!position.size || isPending}
						>
							{((!position.sl || position.sl?.eq(0)) && !triggerPricesGMX.SL)
								? 'Set SL'
								: <img src={icon_edit} alt="Edit Stop Loss button" />}
						</button>
					</div>
					<div className="App-card-row App-card-row_edit-btn">
						<div className="label">
							Take Profit
						</div>
						<div>
							{position.market === 'GNS' && position.tp &&
								(
									!position.tp?.eq(0) &&
										('$' + formatAmount(position.tp, 10, 2, true))
								)
							}
							{position.market === 'GMX' && (triggerPricesGMX.TP 
								? ('$' + formatAmount(triggerPricesGMX.TP, USD_DECIMALS, 2, true))
								: '')
							}
						</div>
						<button
							className="Exchange-list-action"
							onClick={() => openOrderModal(position.market, true, position)}
							disabled={!position.size || isPending}
						>
							{((!position.tp || position.tp?.eq(0)) && !triggerPricesGMX.TP)
								? 'Set TP'
								: <img src={icon_edit} alt="Edit Take Profit button" />}
						</button>
					</div>
				</div>
				<div className="App-card-divider"></div>
				<div className="App-card-options">
					<div className="App-button-option pos-relative">
						{!isPending &&
							<button
								className="App-button-option App-card-option"
								disabled={position.size.eq(0)}
								onClick={() => {
									sellPosition(position, setIsCloseLoading);
									setIsCloseLoading(true);
								}}
							>
								Close
							</button>}
					</div>
				</div>
			</div>}
		</>
	);
};

export default PositionsItem;