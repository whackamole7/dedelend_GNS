import React, { useState } from 'react';
import { formatForContract } from '../../utils/math';
import { convertInputNum } from '../../utils/sepThousands';
import Modal from './Modal';
import { formatAmount, formatAmountFree, USD_DECIMALS } from './../../../views/gmx-test/lib/legacy';
import NumberInput_v3 from './../input/NumberInput_v3';

const SLTPModal = (props) => {
	const {
		visible,
		setVisible,
		isTP,
		onApply,
		title,
		btnText,
		position,
	} = props;

	const [value, setValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const getError = () => {
		if (!position) {
			return btnText;
		}

		if (!value) {
			return btnText;
		}

		if (isSubmitting) {
			return btnText;
		}
		
		const isLong = position.isLong;
		const price = Number(formatAmount(position.markPrice, 20, 0, 0));
		const val = formatForContract(value, 10);

		if (val === 0) {
			return;
		}

		if (!isTP) {
      if ((isLong && val > price) || (!isLong && val < price)) {
        return `${isLong ? 'Long' : 'Short'} SL can't be ${isLong ? 'greater' : 'less'} than mark price.`;
      }
    }
    if (isTP) {
      if ((isLong && val < price) || (!isLong && val > price)) {
        return `${isLong ? 'Long' : 'Short'} TP can't be ${isLong ? 'less' : 'greater'} than mark price.`;
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

	return (
		<Modal
			className="SLTP"
			visible={visible}
			setVisible={setVisible}
			resetModal={() => setValue('')}
		>
			<h1 className="modal__title">{title}</h1>
			<div className="modal__body">
				<NumberInput_v3
					title='Price'
					value={value}
					setValue={setValue}
					displayValue={formatAmount(position?.markPrice, USD_DECIMALS, 2, true)}
					displayValueTitle={'Mark'}
				/>
				<div className="text-inline">
					<p style={{fontSize: 15, lineHeight: 19.5/15}}>
						To remove, set the value to 0
					</p>
				</div>
				<button 
					className="SLTP__btn modal__btn btn btn_hlight"
					onClick={() => {
						setIsSubmitting(true);
						onApply(value, setIsSubmitting);
					}}
					disabled={!isBtnEnabled()}
				>
					{getBtnText()}
				</button>
			</div>
		</Modal>
	);
};

export default SLTPModal;