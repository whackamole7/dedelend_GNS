import React, { useState } from 'react';
import './Selector.scss';
import cx from 'classnames';

const Selector = (props) => {
	const {
		items,
		chosenItem,
		onSelect,
	} = props;


	const [isOpen, setIsOpen] = useState(false);
	const cls = cx("Selector", isOpen && 'open');

	const openSelector = (e) => {
		if (isOpen) {
			closeSelector();
			return;
		}
		
		e.stopPropagation();
		document.addEventListener('click', closeSelector);
		setIsOpen(true);
	}
	const closeSelector = () => {
		document.removeEventListener('click', closeSelector);
		setIsOpen(false);
	}

	return (
		<div className={cls}>
			<button
				className="Selector__chosen-item"
				onClick={openSelector}
			>
				<div className="Selector__chosen-item-info icon-container">
					<img
						src={
							chosenItem &&
								require(`../../../img/icon-${chosenItem}.svg`).default
						}
						alt={`${chosenItem} icon`}
					/>
					{chosenItem}
				</div>
				<img className="icon-down" src={
					require(`../../../img/icon-down-small-white.svg`).default
				} alt="chevron down" />
			</button>
			<div className="Selector__items">
				{items.map(item => {
					if (item === chosenItem) {
						return;
					}

					return (
						<button
							className="Selector__item icon-container"
							onClick={() => {
								onSelect(item);
							}}
						>
							<img
								src={
									item &&
										require(`../../../img/icon-${item}.svg`).default
								}
								alt={`${item} icon`}
							/>
							{item}
						</button>
					)
				})}
			</div>
			
		</div>
	);
};

export default Selector;