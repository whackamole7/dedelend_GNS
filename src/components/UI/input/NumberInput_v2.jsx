import React, { useState } from 'react';
import { convertInputNum } from '../../utils/sepThousands';
import Button from './../button/Button';
import { nonFractionConvert } from './../../utils/sepThousands';

const NumberInput_v2 = (props) => {
	const {
		value,
		setValue,
		setBtnActive,
		currency,
		hasError,
		fractionForbidden,
	} = props;


	const [hasFocus, setHasFocus] = useState('');
	const cls = (props.className ?? '') + (hasError ? ' error' : (hasFocus ? ' hlight' : ''));

	return (
		<div className="input-container input_default">
			<input type="text"
				{...props}
				className={cls}
				value={value}
				onChange={e => {
					if (setBtnActive) {
						setBtnActive(true)
					}
					if (fractionForbidden) {
						setValue()
					}

					if (fractionForbidden) {
						setValue(nonFractionConvert(e.target.value));
					} else {
						setValue(convertInputNum(e.target.value));
					}
				}}
				
				onFocus={() => {
					setHasFocus(true);
				}}
				onBlur={() => {
					setHasFocus(false);

					if(!value && setBtnActive) {
						setBtnActive(false)
					}
				}}
			/>
			{currency ?
				<Button
					type="button"
					className="btn_plain currency-label"
					disabled={true}
				>
					{typeof currency === 'string' ?
						currency
						:
						<>
							<img src={currency.icon} alt={currency.text + ' icon'} />
							{currency.text}	
						</>
					}
				</Button>
				: ''}
		</div>
	);
};

export default NumberInput_v2;