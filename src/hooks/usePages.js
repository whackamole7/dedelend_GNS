import { useMemo } from 'react';
import { getPagesArray } from '../components/utils/pages'

export const usePages = (totalPages, page, changePage) => {
	const pages = useMemo( () => {
		const pagesArray = getPagesArray(totalPages)
		
		return(
			<div className="pages-container">
				<button className="pages-btn-back pages-btn" disabled={page <= 1}
					onClick={() => changePage(page - 1)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M6 11L1 6L6 1" stroke="#384263"/>
					</svg>
				</button>
				<div className="pages">
					{pagesArray.map((p, i) => {
						return <button className={page === p ? 'page current' : 'page'}
							key={p}
							onClick={() => {
								changePage(p)
							}}>
								{p}
							</button>
					})}
				</div>
				<button className="pages-btn-forward pages-btn" disabled={page >= totalPages}
					onClick={() => changePage(page + 1)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1L6 6L1 11" stroke="#6988FF"/>
					</svg>
				</button>
			</div>
			
		)
	}, [totalPages, page])

	return pages;
}