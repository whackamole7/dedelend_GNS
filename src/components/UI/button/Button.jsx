import React from 'react';

const Button = ({children, className, clickHandler, disabled, isMain, ...props}) => {
	const classes = ['btn', (isMain ? 'btn_main' : ''), (disabled ? 'disabled' : ''), (props.btnActive ? 'btn_hlight' : ''), className]
	
	const childProps = { ...props };
	delete childProps.btnActive;
	
	return (
		<button {...childProps} disabled={disabled} className={classes.join(' ')} data-text={children}>
			{
				isMain ? 
					<span>{children.toString()}</span> :
					children
			}
		</button>
	);
};

export default Button;