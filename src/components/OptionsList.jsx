import React from 'react';
import OptionItem from './OptionItem';
import Loader from './UI/loader/Loader';

const OptionsList = ({ options, setBorrowModalState, borrowModalState, setRepayModalState, repayModalState, ...props }) => {
	
	function convertMsToDays(ms) {
		const s = ms / 1000;
		const h = s / 3600;
		const dResult = Math.floor(h / 24);
		const hResult = Math.floor(h % 24);

		return `${dResult}d ${hResult}h`
	}
	
	
	const optionStats = [
		{
			name: 'ID',
			unit: ''
		},
		{
			name: 'Option',
			unit: ''
		},
		{
			name: 'Amount',
			unit: ''
		},
		{
			name: 'Strike',
			unit: '$'
		},
		{
			name: 'Expires In',
			unit: convertMsToDays,
		},
		{
			name: 'Intrinsic Value',
			unit: 'USDC'
		},
		{
			name: 'Borrow Limit',
			unit: 'USDC'
		},
		{
			name: 'Borrow Limit Used',
			unit: 'USDC'
		},
		{
			name: 'Liq. Price',
			unit: '$'
		},
	]
	
	
	return (
		<React.Fragment>
			{
				options.length ?
					<div className={typeof options[0] === 'string' ? "" : "borrow-market__items app-box"}>
						{
							options.map(option => {
								return (
									<OptionItem
										option={option}
										stats={optionStats}
										setBorrowModalState={setBorrowModalState}
										borrowModalState={borrowModalState}
										setRepayModalState={setRepayModalState}
										repayModalState={repayModalState}
										key={option.id ?? option}
										isModalLoading={props.isModalLoading}
									/>
								)
							})
						}
					</div>
					:
					props.filter ? 
						'' : <Loader />
			}
		</React.Fragment>
		
		
	);
};

export default OptionsList;