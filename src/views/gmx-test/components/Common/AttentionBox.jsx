import React from 'react';

const AttentionBox = (props) => {
	const {
		title,
		className,
		children,
	} = props;
	
	return (
		<div className={"App-box Attention-box" + (className ? ` ${className}` : '')}>
			<h2 className="Attention-box__title">{title ?? 'Attention'}</h2>
			<div className="Attention-box__body">
				{children}
			</div>
		</div>
	);
};

export default AttentionBox;