import React from 'react';
import Tooltip from './../Tooltip/Tooltip';
import { formatAmount } from '../../lib/legacy';
import { ImSpinner2 } from 'react-icons/im';
import { t } from '@lingui/macro';
import { USD_DECIMALS, INCREASE } from './../../lib/legacy';
import StatsTooltipRow from '../StatsTooltip/StatsTooltipRow';
import CollateralLocked from './CollateralLocked';
import { DDL_AccountManagerToken, getDgContract } from '../../../../components/utils/contracts';
import { DDL_GMX, WETH_address } from './../../../../components/utils/contracts';
import { useState, useEffect } from 'react';
import { Trans } from '@lingui/macro';
import { ethers, BigNumber } from 'ethers';
import { ADDRESS_ZERO } from '@uniswap/v3-sdk';
import { separateThousands } from './../../../../components/utils/sepThousands';
import { BORDER_COEF } from './../../lib/contracts/constants';

const BorrowsItem = (props) => {
	const {
		position,
		onPositionClick,
		setListSection,
		positionOrders,
		showPnlAfterFees,
		hasPositionProfit,
		positionDelta,
		borrowState, 
		setBorrowState,
		repayState, 
		setRepayState,
		hasOrderError,
		cx,
		dgAddress,
		isModalLoading,
		isLarge,
	} = props;

	const [curPosition, setCurPosition] = useState(position);
	const [borrowed, setBorrowed] = useState(undefined);
	const [isLocked, setIsLocked] = useState(false);
	const [borrowStep, setBorrowStep] = useState(0);
	const [repayStep, setRepayStep] = useState(0);
	const [available, setAvailable] = useState(0);
	const [liqPrice, setLiqPrice] = useState(null);
	
	const borrowPosition = () => {
		setBorrowState({
			isVisible: true,
			position: curPosition,
			step: borrowStep,
			setStep: setBorrowStep,
		})
	}
	const repayPosition = () => {
		setRepayState({
			isVisible: true,
			position: curPosition,
			step: repayStep,
			setStep: setRepayStep,
		})
	}

	useEffect(() => {
		if (typeof borrowed !== 'undefined') {
			setBorrowState({
				...borrowState,
				step: borrowStep,
				position: curPosition,
			})
			setRepayState({
				...repayState,
				step: repayStep,
				position: curPosition,
			})
		}
	}, [repayStep, borrowStep])


	// Key id for positions
	const DG = getDgContract(dgAddress);
	useEffect(() => {
		if (!DG) {
			return;
		}
		
		DG.keyByIndexToken((position.indexToken.address === ADDRESS_ZERO ? WETH_address : position.indexToken.address), position.isLong)
			.then(id => {
				position.ddl.keyId = id;

				// Steps
				DDL_AccountManagerToken.ownerOf(id)
					.then(owner => {
						const isLocked = owner === DDL_GMX.address;
						setIsLocked(isLocked);
						if (isLocked) {
							// Borrowed
							DDL_GMX.borrowedByCollateral(id)
								.then(res => {
									position.ddl.borrowed = res.borrowed;
									DDL_GMX.maxBorrowLimit(id)
										.then(borrowLimit => {
											let availableRaw = borrowLimit / 10**6 - res.borrowed / 10**6;
											const multiplier = position.isLong ? 1 + BORDER_COEF : 1 - BORDER_COEF;
											const entryPrice = position.averagePrice / 10**30;
											const borderPrice = entryPrice * multiplier;
											const curPrice = position.markPrice / 10**USD_DECIMALS;
											if (position.isLong) {
												if (curPrice < borderPrice) {
													availableRaw = 0;
												}
											} else {
												if (curPrice > borderPrice) {
													availableRaw = 0;
												}
											}
											const available = Math.max(availableRaw, 0);
											position.ddl.available = available;
											setAvailable(available);
											setCurPosition(position);
										})
									// const borrowLimit = (position.hasProfit ? (position.delta / 10**USD_DECIMALS) : 0) / 2;
									
									// Liq.Price
									if (res.borrowed.gt(0)) {
										/* let liqPrice;
										const borrowed = res.borrowed / 10**6;
										const size = position.size / 10**30;
										const entryPrice = position.averagePrice / 10**30;
										const amount = size / entryPrice;
										if (position.isLong) {
											liqPrice = entryPrice + ((borrowed / amount) * 1.2);
										} else {
											liqPrice = entryPrice - ((borrowed / amount) * 1.2);
										}

										setLiqPrice(liqPrice); */

										DDL_GMX.currentTriggerPrice(position.ddl.keyId)
											.then(res => {
												setLiqPrice(res / 10**8)
											});
									} else {
										setLiqPrice(null);
									}

									if (res.borrowed.gt(0)) {
										setRepayStep(0);
									} else {
										setRepayStep(1);
									}
									setBorrowStep(2);
									setBorrowed(res.borrowed);
								})
						} else {
							setLiqPrice(null);
							
							DDL_AccountManagerToken.getApproved(id)
								.then(addr => {
									position.ddl.borrowed = BigNumber.from(0);
									// const borrowLimit = (position.hasProfit ? (position.delta / 10**USD_DECIMALS) : 0) / 2;
									DDL_GMX.maxBorrowLimit(id)
										.then(borrowLimit => {
											let availableRaw = borrowLimit / 10**6;
											const multiplier = position.isLong ? 1 + BORDER_COEF : 1 - BORDER_COEF;
											const entryPrice = position.averagePrice / 10**30;
											const borderPrice = entryPrice * multiplier;
											const curPrice = position.markPrice / 10**USD_DECIMALS;
											if (position.isLong) {
												if (curPrice < borderPrice) {
													availableRaw = 0;
												}
											} else {
												if (curPrice > borderPrice) {
													availableRaw = 0;
												}
											}
											const available = Math.max(availableRaw, 0);
											position.ddl.available = available;
											setAvailable(available);
											setCurPosition(position);
										})

									if (addr === DDL_GMX.address) {
										setBorrowStep(1);
									} else {
										setBorrowStep(0);
									}
									
									setBorrowed(BigNumber.from(0));
								})
						}
					});
			});

	}, [dgAddress, borrowState, repayState, isModalLoading, position]);

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
					<div>${available.toFixed(2)}</div>
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
					${borrowed ? formatAmount(borrowed, 6, 2, true) : '...'}
				</td>
				<td className="" onClick={() => {
					// onPositionClick(position)
					return;
				}}>
					<Tooltip
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
					{liqPrice ? `$${separateThousands(liqPrice.toFixed(2))}` : '—'}
				</td>
				<td className="" onClick={() => {
					// onPositionClick(position)
					return;
				}}>
					{'10.00%'}
				</td>
	
				<td className="td-btn pos-relative">
					<Tooltip
						className={"btn-tooltip nowrap" + ((typeof borrowed === 'undefined' || !position.hasProfit || available <= 0) ? "" : " hidden")}
						position="left-bottom"
						enabled={true}
						handle=""
						renderContent={() => {
							return (
								<div>
									<span className='spacing'>Y</span>ou can borrow when <br className='br-mobile' />the price is {position.isLong ? 'above' : 'below'} ${separateThousands(((position.averagePrice / 10**30) * (position.isLong ? (1 + BORDER_COEF) : (1 - BORDER_COEF))))}
								</div>
							);
						}} />
					<button
						className="Exchange-list-action"
						onClick={() => borrowPosition(position)}
						disabled={((typeof borrowed === 'undefined') || !position.hasProfit || available <= 0)}
					>
						Borrow
					</button>
				</td>
				<td className="td-btn">
					<button
						className="Exchange-list-action"
						onClick={() => repayPosition(position)}
						disabled={typeof borrowed === 'undefined' || !isLocked}
					>
						Repay
					</button>
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
							<Trans>Available</Trans>
						</div>
						<div>${available.toFixed(2)}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							<Trans>Debt</Trans>
						</div>
						<div>${formatAmount(borrowed, 6, 2, true)}</div>
						<div>
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
							<Tooltip
								className="has-hint-tooltip nowrap"
								handle="Liq. Price"
								position="left-bottom"
								enabled={true}
								renderContent={() => {
									return (
										<div>
											If the price reaches this price<br /> your loan will be liquidated
										</div>
									);
								}}
							/>
							
						</div>
						<div>{liqPrice ? `$${separateThousands(liqPrice.toFixed(2))}` : '—'}</div>
					</div>
					<div className="App-card-row">
						<div className="label">
							<Trans>Borrow APR</Trans>
						</div>
						<div>{'10.00%'}</div>
					</div>
				</div>
				<div className="App-card-divider"></div>
				<div className="App-card-options">
					<div className="pos-relative App-button-option">
						<Tooltip
							className={"btn-tooltip nowrap" + ((typeof borrowed === 'undefined' || !position.hasProfit || available <= 0) ? "" : " hidden")}
							position="left-bottom"
							enabled={true}
							handle=""
							renderContent={() => {
								return (
									<div>
										<span className='spacing'>Y</span>ou can borrow when <br className='br-mobile' />the price is {position.isLong ? 'above' : 'below'} ${separateThousands(((position.averagePrice / 10**30) * (position.isLong ? (1 + BORDER_COEF) : (1 - BORDER_COEF))))}
									</div>
								);
							}} />
						<button
							className="App-button-option App-card-option"
							disabled={((typeof borrowed === 'undefined') || !position.hasProfit || available <= 0)}
							onClick={() => borrowPosition()}
						>
							<Trans>Borrow</Trans>
						</button>
					</div>
				
					<button
						className="App-button-option App-card-option"
						disabled={typeof borrowed === 'undefined' || !isLocked}
						onClick={() => repayPosition()}
					>
						Repay
					</button>

					{isLocked &&
						<CollateralLocked />}
				</div>
			</div>}
		</>
	);
};

export default BorrowsItem;