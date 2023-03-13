import React from 'react';
import Tooltip from './../Tooltip/Tooltip';

const CollateralLocked = () => {
	return (
		<Tooltip
			className="collateral-locked-icon nowrap"
			position="right-bottom"
			enabled={true}
			handle=""
			renderContent={() => {
				return (
					<div>
						<span className='spacing'>Y</span>our position is locked as collateral
					</div>
				);
			}} />
	);
};

export default CollateralLocked;