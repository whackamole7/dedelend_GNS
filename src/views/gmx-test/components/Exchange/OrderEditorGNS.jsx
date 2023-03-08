import React, { useState, useEffect } from 'react';
import { formatForContract } from '../../../../components/utils/math';
import { convertInputNum } from '../../../../components/utils/sepThousands';
import { formatAmount, formatAmountFree, USD_DECIMALS } from '../../lib/legacy';
import Modal from './../../../../components/UI/modal/Modal';
import GNS_Trading from '../../abis/GNS/GNS_Trading.json';
import { ethers } from 'ethers';
import { errAlert, notifySuccess } from '../../../../components/utils/notifications';

const OrderEditorGNS = (props) => {
	const {
		visible,
		setVisible,
		order,
		library
	} = props;
	
	const [priceValue, setPriceValue] = useState('');
	const [TPValue, setTPValue] = useState('');
	const [SLValue, setSLValue] = useState('');

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (order) {
			setPriceValue(convertInputNum(formatAmountFree(order.triggerPrice, 30, 2)));
			if (!order.tp.eq(0)) {
				setTPValue(convertInputNum(formatAmountFree(order.tp, 10, 2)));
			}
			if (!order.sl.eq(0)) {
				setSLValue(convertInputNum(formatAmountFree(order.sl, 10, 2)));
			}
		}
	}, [order]);

	const btnText = 'Update order';
	
	const getError = () => {
		if (!order) {
			return btnText;
		}

		if (isSubmitting) {
			return `Updating...`;
		}

		if (!priceValue && !TPValue && !SLValue) {
			return btnText;
		}

		const isLong = order.isLong;
		const triggerPrice = priceValue 
			? formatForContract(priceValue, 10)
			: Number(formatAmount(order.triggerPrice, 20, 0, 0));

		const SLVal = formatForContract(SLValue, 10);
		const TPVal = formatForContract(TPValue, 10);

		if (SLVal) {
			if ((isLong && SLVal > triggerPrice) || (!isLong && SLVal < triggerPrice)) {
				return `${isLong ? 'Long' : 'Short'} SL can't be ${isLong ? 'greater' : 'less'} than trigger price.`;
			}
		}
		if (TPVal) {
			if ((isLong && TPVal < triggerPrice) || (!isLong && TPVal > triggerPrice)) {
				return `${isLong ? 'Long' : 'Short'} TP can't be ${isLong ? 'less' : 'greater'} than trigger price.`;
			}
		}
	}

	const getBtnText = () => {
		const error = getError();
		if (error) {
			return error;
		}

		return btnText;
	}
	const isBtnEnabled = () => {
		const hasError = Boolean(getError());
		
		if (hasError) {
			return false;
		}

		return true;
	}

	const onApply = () => {
		setIsSubmitting(true);
		
		const price = priceValue ? formatForContract(priceValue, 10) : '0';
		const TP = TPValue ? formatForContract(TPValue, 10) : '0';
		const SL = SLValue ? formatForContract(SLValue, 10) : '0';
		
		const contract = new ethers.Contract(GNS_Trading.address, GNS_Trading.abi, library.getSigner());

		contract.updateOpenLimitOrder(
			order.pairIndex,
			order.index,
			price,
			TP,
			SL
		).then(tsc => {
			console.log(tsc);
      
			tsc.wait()
				.then(() => {
					notifySuccess(`Order update submitted!`, tsc.hash);
					setVisible(false);
				})
		}, errAlert).finally(() => setIsSubmitting(false));
	}

	const reset = () => {
		setPriceValue('');
		setTPValue('');
		setSLValue('');
	}
	
	return (
		<Modal
			className="OrderEditorModal"
			visible={visible}
			setVisible={setVisible}
			resetModal={reset}
		>
			<h1 className="modal__title">Edit Order</h1>
			<div className="modal__body">
				<div className="Exchange-swap-section">
					<div className="Exchange-swap-section-top">
						<div className="muted">
							<div className="Exchange-swap-usd">
								Price
							</div>
						</div>
						<div
							className="muted align-right clickable"
							onClick={() => {
								setPriceValue(formatAmountFree(order?.markPrice, USD_DECIMALS, 2));
							}}
						>
							Mark: {formatAmount(order?.markPrice, USD_DECIMALS, 2, true)}
						</div>
					</div>
					<div className="Exchange-swap-section-bottom">
						<div>
							<input
								placeholder="0.0"
								className="Exchange-swap-input"
								value={priceValue}
								onChange={(e) => {
									setPriceValue(convertInputNum(e.target.value));
								}}
								onFocus={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.add('hlight');
								}}
								onBlur={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.remove('hlight');
								}}
							/>
						</div>
					</div>
				</div>
				<div className="Exchange-swap-section">
					<div className="Exchange-swap-section-top">
						<div className="muted">
							<div className="Exchange-swap-usd">
								Take Profit
							</div>
						</div>
					</div>
					<div className="Exchange-swap-section-bottom">
						<div>
							<input
								placeholder="0.0"
								className="Exchange-swap-input"
								value={TPValue}
								onChange={(e) => {
									setTPValue(convertInputNum(e.target.value));
								}}
								onFocus={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.add('hlight');
								}}
								onBlur={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.remove('hlight');
								}}
							/>
						</div>
					</div>
				</div>
				<div className="Exchange-swap-section">
					<div className="Exchange-swap-section-top">
						<div className="muted">
							<div className="Exchange-swap-usd">
								Stop Loss
							</div>
						</div>
					</div>
					<div className="Exchange-swap-section-bottom">
						<div>
							<input
								placeholder="0.0"
								className="Exchange-swap-input"
								value={SLValue}
								onChange={(e) => {
									setSLValue(convertInputNum(e.target.value));
								}}
								onFocus={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.add('hlight');
								}}
								onBlur={(e) => {
									e.target.parentElement.parentElement.parentElement.classList.remove('hlight');
								}}
							/>
						</div>
					</div>
				</div>
				<button 
					className="modal__btn btn btn_hlight"
					onClick={onApply}
					disabled={!isBtnEnabled()}
				>
					{getBtnText()}
				</button>
			</div>
		</Modal>
	);
};

export default OrderEditorGNS;