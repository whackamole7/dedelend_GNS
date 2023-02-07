import React, { useState, useEffect, useContext } from 'react';
import BorrowModal from '../../components/UI/modal/BorrowModal';
import { useFilter } from './../../hooks/useFilter';
import { getPageCount } from './../../components/utils/pages';
import Pagination from './../../components/UI/pagination/Pagination';
import RepayModal from './../../components/UI/modal/RepayModal';
import { UserStatsContext } from './../../context/context';
import { connectWallet } from '../../components/utils/wallet';
import OptionsList from './../../components/OptionsList';
import { getOptionStats } from './../../components/utils/stats';
import MarketInfoBoard from './../../components/MarketInfoBoard';

const BorrowMarket = ({ walletAddress, setWalletAddress }) => {

	const {userStats, setUserStats} = useContext(UserStatsContext)
	const [isModalLoading, setIsModalLoading] = useState(false)

	const updateOptionStats = (id, isETH, updateModalState = true) => {
		getOptionStats(id, isETH)
			.then(res => {
				const options = userStats.options.slice()

				let optI;
				options.find((opt, i) => {
					if (opt.id === id) {
						optI = i;
						return true;
					}
				})

				options[optI] = {
					...options[optI],
					...res
				}

				setUserStats({
					...userStats,
					options
				})

				if (updateModalState) {
					setRepayModalState({
						...repayModalState,
						initStep: res.borrowLimitUsed > 0 ? 0 : 1,
						option: options[optI]
					})
					setBorrowModalState({
						...borrowModalState,
						option: options[optI]
					})
				}

				setIsModalLoading(false)
			})
	}
	
	// Modal window
	const [borrowModalState, setBorrowModalState] = useState({
		isVisible: false,
		option: {},
		initStep: 0
	})
	const [repayModalState, setRepayModalState] = useState({
		isVisible: false,
		option: {},
		initStep: 0
	})
	const setBorrowModalVisible = (bool) => {
		setBorrowModalState({
			...borrowModalState,
			isVisible: bool
		})
	}
	const setRepayModalVisible = (bool) => {
		setRepayModalState({
			...repayModalState,
			isVisible: bool
		})
	}
	

	// Pagination
	const [totalPages, setTotalPages] = useState(0);
	const [limit] = useState(10);
	const [page, setPage] = useState(1);
	const changePage = (page) => {
		setPage(page);
		fetchOptions(limit, page, filteredOptions);
	}


	
	const [isAuth, setIsAuth] = useState(false)

	useEffect(() => {
		setIsAuth(Boolean(walletAddress))
	}, [walletAddress])

	const fetchOptions = (limit, page, options) => {
		if (!options) {
			return
		}
		
		const fetchedOptions = []
		const lowerBound = limit * (page - 1);
		const upperBound = limit * page >= options.length ?
			 options.length : limit * page;
		
		for(let i = lowerBound; i < upperBound; i++) {
			const option = options[i];
			
			if (option) {
				fetchedOptions.push(option);
			} else {
				break;
			}
		}

		if (!fetchedOptions.length) {
			if (page !== 1) {
				changePage(page - 1);
			}
		}

		setOptions(fetchedOptions);
		const totalCount = options.length;
		setTotalPages(getPageCount(totalCount, limit))
	}
	
	const [options, setOptions] = useState([]);
	const [filter, setFilter] = useState('');
	
	useEffect(() => {
		fetchOptions(limit, page, filteredOptions)
	}, [limit, page, filter, userStats.options])

	const filteredOptions = useFilter(userStats.options, filter);

	return (
		<div className='block borrow-market'>
			<h1 className='block__title'>Borrow Market</h1>

			<MarketInfoBoard />

			<div className="borrow-market__items-container">
				<div className="borrow-market__filter filter">
					<div className="input-container">
						<input type="checkbox"
						onChange={(e) => {
							if (e.target.checked) {
								setFilter('activeBorrows')
							} else {
								setFilter('')
							}
						}}
						disabled={!isAuth || (!options.length && !filter)}	/>
						<label>Show only active borrows</label>
					</div>
				</div>
				{
					isAuth ?
					<OptionsList filter={filter} options={options} setBorrowModalState={setBorrowModalState} borrowModalState={borrowModalState} setRepayModalState={setRepayModalState} repayModalState={repayModalState} isModalLoading={isModalLoading}></OptionsList>
					:
					<div className='auth-prompt app-box _mobile-fluid'>
						<button onClick={() => connectWallet(setWalletAddress)}>Connect wallet</button> to see a list of options
					</div>
				}
				
			</div>
			{isAuth && userStats.options ?
				<React.Fragment>
					<BorrowModal state={borrowModalState} setVisible={setBorrowModalVisible} walletAddress={walletAddress}
					updateOptionStats={updateOptionStats}
					isLoading={isModalLoading}
					setIsLoading={setIsModalLoading} />
					<RepayModal state={repayModalState} setVisible={setRepayModalVisible} walletAddress={walletAddress}
					updateOptionStats={updateOptionStats}
					isLoading={isModalLoading}
					setIsLoading={setIsModalLoading} />

					<Pagination
						totalPages={totalPages}
						page={page}
						changePage={changePage}
					></Pagination>
				</React.Fragment>
				:
				""
			}
		</div>
	);
};

export default BorrowMarket;