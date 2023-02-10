import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { USDC_signed, DDL_GMX } from '../../utils/contracts';
import Loader from './../loader/Loader';
import { sepToNumber, separateThousands } from './../../utils/sepThousands';
import { floor, formatForContract } from './../../utils/math';
import { errAlert } from '../../utils/notifications';
import { ethers } from "ethers";
import { formatAmount, USD_DECIMALS } from './../../../views/gmx-test/lib/legacy';
import { notifySuccess } from './../../utils/notifications';
import { APY, BORDER_COEF } from './../../utils/constants';


const RepayModal = (props) => {
	const {
		state, 
		setVisible, 
		updateOptionStats, 
		isLoading, 
		setIsLoading,
	} = props;

	const option = state.option;
	const contract = option?.contract;
	const position = state.position;

	const {globalStats} = useContext(GlobalStatsContext)
	const [inputVal, setInputVal] = useState('');
	const [liqPrice, setLiqPrice] = useState(null);
	const [oldLiqPrice, setOldLiqPrice] = useState(null);
	const [step, setStep] = [state.step ?? 0, state.setStep];
	const [positionStats, setPositionStats] = useState({});
	const [borrowed, setBorrowed] = useState(null);
	const [repay, setRepay] = useState(null);
	const [borrowLimit, setBorrowLimit] = useState(null);
	
	useEffect(() => {
		if (position) {
			if (!Object.keys(position).length) {
				return;
			}

			DDL_GMX.borrowedByCollateral(position.ddl.keyId)
				.then(res => {
					const borrowed = res.borrowed / 10**6;
					DDL_GMX.calculateUpcomingFee(position.ddl.keyId)
						.then(res => {
							const fee = res / 10**6;
							setRepay(borrowed + fee);
							setBorrowed(borrowed);
						})
				})

			DDL_GMX.maxBorrowLimit(position.ddl.keyId)
				.then(res => {
					setBorrowLimit(res / 10**6);
				})
		}
	}, [state, isLoading, state.position]);

	useEffect(() => {
		let curInputVal = inputVal;
		if (sepToNumber(inputVal) > 0 && sepToNumber(inputVal) > repay) {
			curInputVal = repay;
			setInputVal(curInputVal);
		}

		if (option) {
			if (typeof option !== 'object' || !Object.keys(option).length) {
				return;
			}
			
			let classic, result;
			const prior = option.priorLiqPrice;
			const val = sepToNumber(inputVal)
	
			const isCALL = option.name.includes('CALL')
	
			if (isCALL) {
				classic = option.strike + (((option.borrowLimitUsed - val) / option.amount) * 1.2)
				
				result = Math.max(prior, classic);
			} else {
				classic = option.strike - (((option.borrowLimitUsed - val) / option.amount) * 1.2)
	
				result = Math.min(prior, classic);
			}
	
			if (result === prior && sepToNumber(inputVal) >= repay) {
				setLiqPrice('—')
				return;
			}
	
			setLiqPrice(floor(result))
		} else if (position) {
			if (!Object.keys(position).length) {
				return;
			}
			if (borrowLimit === null) {
				return;
			}
			
			const positionProfit = (position.delta / 10**USD_DECIMALS);
			// const borrowLimit = position.hasProfit ? (positionProfit / 2) : 0;

			// Loan-To-Value
			const input = sepToNumber(curInputVal ?? 0);
			const loanToValue = borrowLimit !== 0 ? ((borrowed - input) / positionProfit) : 0;

			// Liq.Price
			let liqPrice;
			let oldLiqPrice;
			const size = position.size / 10**USD_DECIMALS;
			const entryPrice = position.averagePrice / 10**USD_DECIMALS;
			const amount = size / entryPrice;
			if (position.isLong) {
				liqPrice = entryPrice + (((borrowed - input) / amount) * 1.2);
				oldLiqPrice = entryPrice + ((borrowed / amount) * 1.2);
			} else {
				liqPrice = entryPrice - (((borrowed - input) / amount) * 1.2);
				oldLiqPrice = entryPrice - ((borrowed / amount) * 1.2);
			}
			if (isNaN(liqPrice)) {
				setLiqPrice(null);
				setOldLiqPrice(null);
			} else {
				if (input >= borrowed) {
					setLiqPrice(Infinity);
				} else {
					setLiqPrice(liqPrice);
				}
				setOldLiqPrice(oldLiqPrice);
			}

			setPositionStats({
				loanToValue: Math.min(loanToValue, 1),
			});
		}
	}, [state, borrowed, inputVal, state.position]);

	useEffect(() => {
		if (typeof liqPrice !== 'number' || !isFinite(liqPrice)) {
			return;
		}

		const borderCoef = BORDER_COEF;
		const multiplier = position.isLong ? 1 + borderCoef : 1 - borderCoef;
		const entryPrice = position.averagePrice / 10**30;
		const borderPrice = entryPrice * multiplier;
		const result = position.isLong ? Math.max(liqPrice, borderPrice) : Math.min(liqPrice, borderPrice)
		setLiqPrice(result);
	}, [liqPrice])
	
	if (option) {
		setRepay(option.realVals?.borrowLimitUsed);
	}

	const setMaxVal = () => {
		setInputVal(repay)
	}
	

	const steps = [
		{
			title: "Repay",
			onSubmit: (e) => {
				e.preventDefault();
				
				setIsLoading(true);

				if (option) {
					contract.repay(option.id, formatForContract(inputVal))
						.then(res => {
							console.log('Repay transaction:', res);

							res.wait()
								.then(() => {
									setInputVal('');
									updateOptionStats(option.id, option.isETH);
								})
						},
						err => {
							console.log(err);

							if (err.message.includes('transfer amount exceeds allowance')) {
								USDC_signed.approve(contract.address, ethers.constants.MaxUint256)
								.then(res => {
									res.wait()
										.then(() => {
											contract.repay(option.id, formatForContract(inputVal))
												.then(res => {
													res.wait()
														.then(() => {
															setInputVal('')
															updateOptionStats(option.id, option.isETH)
														})
												},
												err => {
													errAlert(err)
													setIsLoading(false)
												})
											
										})
									
								}, err => {
									errAlert(err)
									setIsLoading(false)
								})
							} else {
								errAlert(err)
								setIsLoading(false)
							}
						})
				} else if (position) {
					const proceedRepay = () => {
						DDL_GMX.repay(position.ddl.keyId, formatForContract(inputVal))
							.then(res => {
								console.log('Repay transaction:', res);

								res.wait()
									.then(() => {
										notifySuccess(`Repayed ${sepToNumber(inputVal).toFixed(2)} USDC`, res.hash);
										setInputVal('');
										setIsLoading(false);
									})
							},
							err => {
								console.log(err);
									
								if (err.message.includes('transfer amount exceeds allowance')) {
									approveUSDC();
								} else {
									errAlert(err);
									setIsLoading(false);
								}
							});
					}
					const approveUSDC = () => {
						USDC_signed.approve(DDL_GMX.address, ethers.constants.MaxUint256)
							.then(res => {
								res.wait()
									.then(() => {
										proceedRepay();
									})
							}, err => {
								errAlert(err)
								setIsLoading(false)
							})
					}

					proceedRepay();
				}
				
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: false,
				state: {
					val: inputVal,
					setVal: setInputVal
				}
			},
			btnIsActive: false
		},
		{
			title: "Unlock Collateral",
			onSubmit: (e) => {
				e.preventDefault()
				setIsLoading(true);

				if (option) {
					contract.unlock(option.id)
						.then(res => {
							console.log('Unlock transaction:', res);

							res.wait()
								.then(() => {
									updateOptionStats(option.id, option.isETH, false)
									setVisible(false)
									setStep(0)
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				} else if (position) {
					DDL_GMX.unlock(position.ddl.keyId)
						.then(res => {
							console.log('Unlock transaction:', res);

							res.wait()
								.then(() => {
									setVisible(false);
									setStep(0);
									setIsLoading(false);
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				}
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: true
			},
			btnIsActive: true
		}
	]


	return (
		<Modal className={'modal_borrow'} visible={state.isVisible} setVisible={setVisible}>
			<h1 className='modal__title'>Repay USDC</h1>
			<div className="modal__body">
				<div className="modal__steps steps">
					{steps.map((el, i) => {
						return (
							<div className={i === step ? 'modal__step step current' : 'modal__step step'} key={i}>
								{el.title}
							</div>
						)
					})}
				</div>
				<div className="modal__info">
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow APR:</div>
						<div className="modal__info-field-val">{APY}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow Limit:</div>
						<div className="modal__info-field-val">{(option ? separateThousands(option.borrowLimit) : separateThousands(borrowLimit?.toFixed(2))) + ' USDC'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title nowrap">Loan-To-Value:</div>
							<div className="modal__info-field-val">
								{(option ? floor((option.borrowLimitUsed / option.intrinsicValue) * 100) : floor((positionStats.loanToValue) * 100)) + '%'}
							</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Repay:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(option ? repay : repay?.toFixed(2)) + ' USDC'}</div>
					</div>
					{
						step === 0 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className={"modal__info-field-val modal__info-field-val_complex"}>
									{((oldLiqPrice !== null) && (oldLiqPrice !== liqPrice) 
									? 
										<>
											<span className='val_minor'>
												{`$${separateThousands(oldLiqPrice?.toFixed(2))}`}
											</span>
											<span className='icon_arrow' />
										</>
										: '')}
									<span className={(isFinite(liqPrice) ? "" : " icon-infinity")}>
										{
											isFinite(liqPrice) &&
											(liqPrice !== null ? `$${separateThousands(liqPrice?.toFixed(2))}` : '—')
										}
										
									</span>
								</div>
							</div>
							: ""
					}
				</div>
				<div className="modal__form-wrapper">
					{
						isLoading ?
							<Loader />
							:
							<Form maxVal={repay} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
							isStep={step < steps.length - 1}
							modalVisible={state.isVisible}
							btnIsActive={steps[step].btnIsActive}
							maxWarningMsg={'Amount is too big'}
							isModal={true}
							maxOnClick={setMaxVal}></Form>
					}
				</div>
			</div>
		</Modal>
	);
};

export default RepayModal;