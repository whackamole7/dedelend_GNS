import React from 'react';

const Loader = () => {
	return (
		<div className='loader-container'>
			<svg viewBox="0 0 100 100">
				<defs>
				</defs>
				<circle className="loader" style={{fill:'transparent',stroke:'#fff',strokeWidth: '7px',strokeLinecap: 'round'}} cx="50" cy="50" r="45"/>
			</svg>
		</div>
	);
};

export default Loader;