import React from 'react';
import './Slippage.scss';
import { convertInputNum, separateThousands, sepToNumber } from './../../../../components/utils/sepThousands';

const SlippageInput = ({ value, setValue }) => {
	return (
		<div className="Exchange-swap-section Slippage-input-container">
			<div className="Exchange-swap-section-bottom">
				<div className="Exchange-swap-input-container">
					<input
						placeholder="Slippage (%)"
						className="Exchange-swap-input Slippage-input"
						value={value}
						onChange={(e) => {
							const val = (e.target.value).replace(/[^0-9]/g, '').replace(/^0\d/, '');
							// const valStr = convertInputNum(e.target.value)
							// const val = sepToNumber(valStr);
							
							if (val > 100) {
								setValue(100)
							} else if (val < 0) {
								setValue(0)
							} else {
								setValue(val)
							}
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
	)
};

export default SlippageInput;