

export const getSlTpFromPercentage = (isTP, percentage, openPriceNum, leverage) => {
	if (!percentage) {
		return 0;
	}
	
	if (isTP) {
		return (
			(
				openPriceNum + (0.01 * openPriceNum * (percentage / leverage))
			) * 10**10
		).toFixed(0);
	} else {
		return (
			(
				openPriceNum - (0.01 * openPriceNum * (percentage / leverage))
			) * 10**10
		).toFixed(0);
	}
}