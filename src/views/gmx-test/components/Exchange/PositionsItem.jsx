import React from 'react';
import Tooltip from './../Tooltip/Tooltip';
import { formatAmount } from '../../lib/legacy';
import { ImSpinner2 } from 'react-icons/im';
import { t } from '@lingui/macro';
import { USD_DECIMALS, INCREASE } from './../../lib/legacy';
import StatsTooltipRow from '../StatsTooltip/StatsTooltipRow';
import { floor } from './../../../../components/utils/math';
import CollateralLocked from './CollateralLocked';
import { DDL_AccountManagerToken, getDgContract, WETH_address } from '../../../../components/utils/contracts';
import { DDL_GMX } from './../../../../components/utils/contracts';
import { useState, useEffect } from 'react';
import { Trans } from '@lingui/macro';
import { BigNumber } from 'ethers';
import { ADDRESS_ZERO } from '@uniswap/v3-sdk';

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
		setStopLoss,
		setTakeProfit,
		isLarge,
	} = props;

	const marketImg = require(`../../../../img/icon-${position.market}.svg`).default;

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
							handle={`$${formatAmount(position.collateralAfterFee, USD_DECIMALS, 2, true)}`}
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
					</td>
					<td onClick={() => {
						// onPositionClick(position)
						return;
					}}>
						{`$${formatAmount(position.markPrice, USD_DECIMALS, 2, true)}`}
					</td>
					<td className="" onClick={() => {
						// onPositionClick(position)
						return;
					}}>
						${formatAmount(position.averagePrice, USD_DECIMALS, 2, true)}
					</td>
					<td className="" onClick={() => {
						// onPositionClick(position)
						return;
					}}>
						${formatAmount(liquidationPrice, USD_DECIMALS, 2, true)}
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
									{position.deltaStr} ({position.deltaPercentageStr})
								</div>
							)}
						</div>
						
					</td>
					<td>
						<button
							className="Exchange-list-action"
							onClick={() => setStopLoss(position)}
							disabled={position.size.eq(0)}
						>
							Set SL
						</button>
					</td>
					<td>
						<button
							className="Exchange-list-action"
							onClick={() => setTakeProfit(position)}
							disabled={position.size.eq(0)}
						>
							Set TP
						</button>
					</td>
					<td className="td-btn pos-relative">
						<button
							className="Exchange-list-action"
							onClick={() => sellPosition(position)}
							disabled={position.size.eq(0)}
						>
							Close
						</button>
						{/* <PositionDropdown
							handleEditCollateral={() => {
								editPosition(position);
							}}
							handleShare={() => {
								setPositionToShare(position);
								setIsPositionShareModalOpen(true);
							}}
							handleMarketSelect={() => {
								onPositionClick(position);
							}}
						/> */}
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
							<div className="Exchange-list-token">{position.indexToken.symbol}</div>
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
							<Trans>Net Value</Trans>
						</div>
						<div>
							<Tooltip
								handle={`$${formatAmount(position.netValue, USD_DECIMALS, 2, true)}`}
								position="right-bottom"
								handleClassName="plain"
								renderContent={() => {
									return (
										<>
											Net Value:{" "}
											{showPnlAfterFees
												? "Initial Collateral - Fees + PnL"
												: "Initial Collateral - Borrow Fee + PnL"}
											<br />
											<br />
											<StatsTooltipRow
												label="Initial Collateral"
												value={formatAmount(position.collateral, USD_DECIMALS, 2, true)}
											/>
											<StatsTooltipRow label="PnL" value={position.deltaBeforeFeesStr} showDollar={false} />
											<StatsTooltipRow
												label="Borrow Fee"
												value={formatAmount(position.fundingFee, USD_DECIMALS, 2, true)}
											/>
											<StatsTooltipRow
												label="Open + Close fee"
												value={formatAmount(position.positionFee, USD_DECIMALS, 2, true)}
											/>
											<StatsTooltipRow
												label="PnL After Fees"
												value={`${position.deltaAfterFeesStr} (${position.deltaAfterFeesPercentageStr})`}
												showDollar={false}
											/>
										</>
									);
								}}
							/>
						</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							Size
						</div>
						<div>${formatAmount(position.size, USD_DECIMALS, 2, true)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							Collteral
						</div>
						<div>
							<Tooltip
								handle={`$${formatAmount(position.collateralAfterFee, USD_DECIMALS, 2, true)}`}
								position="right-bottom"
								handleClassName={cx("plain", { negative: position.hasLowCollateral })}
								renderContent={() => {
									return (
										<>
											{position.hasLowCollateral && (
												<div>
													WARNING: This position has a low amount of collateral after deducting borrowing
													fees, deposit more collateral to reduce the position's liquidation risk.
													<br />
													<br />
												</div>
											)}
											<StatsTooltipRow
												label="Initial Collateral"
												value={formatAmount(position.collateral, USD_DECIMALS, 2, true)}
											/>
											<StatsTooltipRow
												label="Borrow Fee"
												value={formatAmount(position.fundingFee, USD_DECIMALS, 2, true)}
											/>
											<StatsTooltipRow label={t`Borrow Fee / Day`} value={borrowFeeUSD} />
											<span>Use the "Edit" button to deposit or withdraw collateral.</span>
										</>
									);
								}}
							/>
						</div>
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
						<div style={{ width: 100, display: 'block' }}>
							{position.deltaStr && (
								<div
									className={cx("Exchange-list-info-label", {
										positive: hasPositionProfit && positionDelta.gt(0),
										negative: !hasPositionProfit && positionDelta.gt(0),
										muted: positionDelta.eq(0),
									})}
								>
									{position.deltaStr} ({position.deltaPercentageStr})
								</div>
							)}
						</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							Stop Loss
						</div>
						<button
							className="Exchange-list-action"
							onClick={() => setTakeProfit(position)}
							disabled={position.size.eq(0)}
						>
							Set TP
						</button>
					</div>
					<div className="App-card-row">
						<div className="label">
							Take Profit
						</div>
						<button
							className="Exchange-list-action"
							onClick={() => setTakeProfit(position)}
							disabled={position.size.eq(0)}
						>
							Set TP
						</button>
					</div>
				</div>
				<div className="App-card-divider"></div>
				<div className="App-card-options">
					<div className="App-button-option pos-relative">
						<button
							className="App-button-option App-card-option"
							disabled={position.size.eq(0)}
							onClick={() => sellPosition(position)}
						>
							Close
						</button>
					</div>
				</div>
			</div>}
		</>
	);
};

export default PositionsItem;