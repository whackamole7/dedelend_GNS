import React, { useState } from 'react';
import cx from 'classnames';
import { convertInputNum } from '../../utils/sepThousands';

const NumberInput_v3 = (props) => {
	const {
		title,
		hasDisplayValue,
		displayValueTitle,
		displayValue,
		value,
		setValue,
		hasError,
	} = props;

	const [hasFocus, setHasFocus] = useState(false);

	const cls = cx(props.className, hasFocus && 'hlight', hasError && 'error');
	
	return (
		<div className={"Exchange-swap-section" + (cls && ` ${cls}`)}>
			<div className="Exchange-swap-section-top">
				<div className="muted">
					<div className="Exchange-swap-usd">
						{title}
					</div>
				</div>
				{hasDisplayValue && (
					<div
						className="muted align-right clickable"
						onClick={() => {
							setValue(displayValue);
						}}
					>
						{displayValueTitle} {displayValue}
					</div>
				)}
			</div>
			<div className="Exchange-swap-section-bottom">
				<div>
					<input
						placeholder="0.0"
						className="Exchange-swap-input"
						value={value}
						onChange={(e) => {
							setValue(convertInputNum(e.target.value));
						}}
						onFocus={(e) => {
							setHasFocus(true);
						}}
						onBlur={(e) => {
							setHasFocus(false);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default NumberInput_v3;