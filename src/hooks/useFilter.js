import { useMemo } from 'react';

export const useFilter = (items = [], filter) => {
	const filterItems = (filter) => {
		if (!filter) {
			return items;
		}

		switch(filter) {
			case 'activeBorrows':
				return items.filter(item => {
					return Number(item.borrowLimitUsed) !== 0;
				})
			default: 
				return items;
		}
	}
	
	const filteredItems = useMemo(() => {
		return filterItems(filter)
	}, [items, filter])

	

	return filteredItems;
}