

export const getSlTpFromPercentage = (isLong, isTP, percentage, openPriceNum, leverage, fees) => {
	if (!percentage) {
		return 0;
	}
	
	if ((isTP && isLong) || (!isTP && !isLong)) {
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