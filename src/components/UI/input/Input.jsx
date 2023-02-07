import React from 'react';

const Input = ({msg, ...props}) => {
	const childProps = { ...props };
	delete childProps.setValue;
	delete childProps.setBtnActive;
	
	return (
		<div className='input-container'>
			<input type="text" {...childProps} />
			<span className="msg">{msg}</span>
		</div>
	);
};

export default Input;