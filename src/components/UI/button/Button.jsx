import React from 'react';
import cx from 'classnames';

const Button = ({children, className, clickHandler, disabled, isMain, ...props}) => {
	const classes = cx('btn', className, (isMain && 'btn_main'), (props.btnActive && 'btn_hlight'));
	
	const childProps = { ...props };
	delete childProps.btnActive;
	
	return (
		<button {...childProps} disabled={disabled} className={classes} data-text={children}>
			{
				isMain ? 
					<span>{children.toString()}</span> :
					children
			}
		</button>
	);
};

export default Button;