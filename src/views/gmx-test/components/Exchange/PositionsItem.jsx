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
		dgAddress,
		isLarge,
	} = props;

	const [isLocked, setIsLocked] = useState(false);

	useEffect(() => {
		const DG = getDgContract(dgAddress);
		if (!DG) {
			return
		}
		DG.keyByIndexToken((position.indexToken.address === ADDRESS_ZERO ? WETH_address : position.indexToken.address), position.isLong)
			.then(id => {
				DDL_AccountManagerToken.ownerOf(id)
					.then(owner => {
						setIsLocked(owner === DDL_GMX.address);
					});
			})
	}, [dgAddress, position])

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
							{position.leverage && (
								<span className="muted">{formatAmount(position.leverage, 4, 2, true)}x&nbsp;</span>
							)}
							<span className={cx({ positive: position.isLong, negative: !position.isLong })}>
								{position.isLong ? "Long" : "Short"}
							</span>
						</div>
					</td>
					<td style={{width: 150, display: 'block'}}>
						<div>
							{!position.netValue && "Opening..."}
							{position.netValue && (
								<Tooltip
									handle={`$${formatAmount(position.netValue, USD_DECIMALS, 2, true)}`}
									position="left-bottom"
									handleClassName="plain"
									renderContent={() => {
										return (
											<>
												Net Value:{" "}
												{showPnlAfterFees
													? t`Initial Collateral - Fees + PnL`
													: t`Initial Collateral - Borrow Fee + PnL`}
												<br />
												<br />
												<StatsTooltipRow
													label={t`Initial Collateralt`}
													value={formatAmount(position.collateral, USD_DECIMALS, 2, true)}
												/>
												<StatsTooltipRow label={`PnL`} value={position.deltaBeforeFeesStr} showDollar={false} />
												<StatsTooltipRow
													label={t`Borrow Fee`}
													value={formatAmount(position.fundingFee, USD_DECIMALS, 2, true)}
												/>
												<StatsTooltipRow
													label={`Open + Close fee`}
													value={formatAmount(position.positionFee, USD_DECIMALS, 2, true)}
												/>
												<StatsTooltipRow
													label={`PnL After Fees`}
													value={`${position.deltaAfterFeesStr} (${position.deltaAfterFeesPercentageStr})`}
													showDollar={false}
												/>
											</>
										);
									}}
								/>
							)}
						</div>
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
					</td>
					<td>
						<div>${formatAmount(position.size, USD_DECIMALS, 2, true)}</div>
						{positionOrders.length > 0 && (
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
						<Tooltip
							style={{width: 75, display: 'block'}}
							handle={`$${formatAmount(position.markPrice, USD_DECIMALS, 2, true)}`}
							position="left-bottom"
							handleClassName="plain"
							renderContent={() => {
								return (
									<div>
										Click on a row to select the position's market, then use the swap box to increase your
										position size if needed.
										<br />
										<br />
										Use the "Close" button to reduce your position size, or to set stop-loss / take-profit orders.
									</div>
								);
							}}
						/>
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

					<td className="td-btn pos-relative">
						<Tooltip
							className={"btn-tooltip nowrap" + (isLocked ? "" : " hidden")}
							position="left-bottom"
							enabled={true}
							handle=""
							renderContent={() => {
								return (
									<div>
										Repay your debt to manage<br className='br-mobile' /> the position
									</div>
								);
							}} />
						<button
							className="Exchange-list-action"
							onClick={() => editPosition(position)}
							disabled={position.size.eq(0) || isLocked}
						>
							Edit
						</button>
					</td>
					<td className="td-btn pos-relative">
						<Tooltip
							className={"btn-tooltip nowrap" + (isLocked ? "" : " hidden")}
							position="left-bottom"
							enabled={true}
							handle=""
							renderContent={() => {
								return (
									<div>
										Repay your debt to manage<br className='br-mobile' /> the position
									</div>
								);
							}} />
						<button
							className="Exchange-list-action"
							onClick={() => sellPosition(position)}
							disabled={position.size.eq(0) || isLocked}
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
					<td className="td-btn">
						{isLocked &&
							<CollateralLocked />}
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
							<Tooltip
								className="has-hint-tooltip nowrap"
								handle="IM"
								position="left-bottom"
								enabled={true}
								renderContent={() => {
									return (
										<div>
											The margin reserved for your <br />open positions and open orders
										</div>
									);
								}}
							/>
						</div>
						<div>${formatAmount(position.size, USD_DECIMALS, 2, true)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							<Tooltip
								className="has-hint-tooltip nowrap"
								handle="MM"
								position="left-bottom"
								enabled={true}
								renderContent={() => {
									return (
										<div>
											The margin required to maintain your current <br />positions. If your current margin balance falls <br />below Min. Maintenance Margin, your margin <br />account will be liquidated to repay the debt
										</div>
									);
								}}
							/>
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
				</div>
				<div className="App-card-divider"></div>
				<div className="App-card-options">
					<div className="App-button-option pos-relative">
						<Tooltip
							className={"btn-tooltip nowrap" + (isLocked ? "" : " hidden")}
							position="left-bottom"
							enabled={true}
							handle=""
							renderContent={() => {
								return (
									<div>
										Repay your debt to manage<br className='br-mobile' /> the position
									</div>
								);
							}} />
						<button
							className="App-button-option App-card-option"
							disabled={position.size.eq(0) || isLocked}
							onClick={() => editPosition(position)}
						>
							<Trans>Edit</Trans>
						</button>
					</div>
					<div className="App-button-option pos-relative">
						<Tooltip
							className={"btn-tooltip nowrap" + (isLocked ? "" : " hidden")}
							position="left-bottom"
							enabled={true}
							handle=""
							renderContent={() => {
								return (
									<div>
										Repay your debt to manage<br className='br-mobile' /> the position
									</div>
								);
							}} />
						<button
							className="App-button-option App-card-option"
							disabled={position.size.eq(0) || isLocked}
							onClick={() => sellPosition(position)}
						>
							Close
						</button>
					</div>
					{isLocked &&
						<CollateralLocked />}
				</div>
			</div>}
		</>
	);
};

export default PositionsItem;