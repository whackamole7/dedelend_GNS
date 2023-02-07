import React, { useState } from 'react';
import Button from './UI/button/Button';
import { OptManager } from './utils/contracts';
import { separateThousands } from './utils/sepThousands';

const OptionItem = ({ option, stats, ...props }) => {
	const [borrowStep, setBorrowStep] = useState(0)
	const [repayStep, setRepayStep] = useState(0)
	const [repayDisabled, setRepayDisabled] = useState(true);

	const contract = option.contract;
	

	if (typeof option === 'string') {
		return(
			<div className='borrow-market__warning'>
				{option}
			</div>
		)
	}
	
	OptManager.isApprovedOrOwner(contract.address, option.id)
		.then(res => {
			if (res === true) {
				OptManager.ownerOf(option.id)
					.then(owner => {
						if (owner == contract.address) {
							setBorrowStep(2)
							setRepayDisabled(false)

							if (option.realVals?.borrowLimitUsed <= 0) {
								setRepayStep(1)
							} else {
								setRepayStep(0)
							}
							
						} else {
							setBorrowStep(1)
							setRepayDisabled(true)
						}
					})
				
			} else {
				setBorrowStep(0)
				setRepayStep(0)
				setRepayDisabled(true)
			}
		})

	

	return (
		<div className="borrow-market__item _mobile-fluid" key={option.id}>
			<div className="borrow-market__item-options">
				{
					Object.keys(option).map((key, i) => {
						const stat = stats[i] ?? '';
						if (!stat) {
							return;
						}
						
						let val = '';
						if (typeof stat.unit !== 'function') {
							if (option[key] !== '') {
								let convertedNum;
								if (stat.name === 'ID' || stat.name === 'Option') {
									convertedNum = option[key]
								} else {
									convertedNum = separateThousands(option[key]);
								}
								
								val = stat.unit === '$' ? stat.unit + convertedNum
								: convertedNum + ' ' + stat.unit;
							} else {
								val = '—'
							}
							
						} else {
							val = stat.unit(option[key])
						}

						return(
							<div className="borrow-market__item-option" key={key}>
								<div className="borrow-market__item-option-name">
									{stat.name}
								</div>
								<div className="borrow-market__item-option-val">
									{val}
								</div>
							</div>
						)
					})
				}
			</div>

			<div className="borrow-market__item-btns btns">
				<Button className={'btn_small'} disabled={
					(option.borrowLimit <= 0
						|| option.borrowLimitUsed >= option.borrowLimit
						|| option.expiration <= 60 * 60 * 1000)
				} onClick={() => {
					props.setBorrowModalState({
						...props.borrowModalState,
						isVisible: true,
						option,
						step: borrowStep,
						setStep: setBorrowStep
					})
				}}>Borrow</Button>
				<Button className={"btn_small"} disabled={
					repayDisabled
				} onClick={() => {
					props.setRepayModalState({
						...props.repayModalState,
						isVisible: true,
						option,
						step: repayStep,
						setStep: setRepayStep
					})
				}}>Repay</Button>
			</div>
		</div>
	);
};

export default OptionItem;