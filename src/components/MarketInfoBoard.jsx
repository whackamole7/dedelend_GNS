import React, { useContext } from 'react';
import { GlobalStatsContext, UserStatsContext } from './../context/context';
import { separateThousands } from './utils/sepThousands';
import Currency from './Currency';


const MarketInfoBoard = () => {
	const {globalStats} = useContext(GlobalStatsContext)

	return (
		<div className="info-board app-box _mobile-fluid">
			<div className="info-board__items">
				<div className="info-board__item">
					<div className="info-board__item-title">Total Supplied</div>
					<div className="info-board__item-val">
						<Currency>{globalStats.totalSupplied}</Currency>
					</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Total Borrowed</div>
					<div className="info-board__item-val">
						<Currency>{globalStats.totalBorrowed}</Currency>
					</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Utilization Rate</div>
					<div className="info-board__item-val">
						{separateThousands(globalStats.utilRate, ',') + '%'}
					</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Available to Borrow</div>
					<div className="info-board__item-val">
						<Currency>{globalStats.availToBorrow}</Currency>
					</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Earn APR</div>
					<div className="info-board__item-val">
						{separateThousands(globalStats.borrowAPY, ',') + '%'}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MarketInfoBoard;