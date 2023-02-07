import React from 'react';

const Warning = (props) => {
	return (
		<div className="warning">
			{props.children}
		</div>
	);
};

export default Warning;