import { formatAmount } from "../../views/gmx-test/lib/legacy";


export const getSlTpFromPercentage = (isLong, isTP, percentage, openPriceNum, leverage, fees) => {
	if (!percentage) {
		return 0;
	}

	// const feesDelta = formatAmount(fees, 30, 30, 0) / leverage;
	// const openPriceWithFees = isLong
	// 	? openPriceNum + feesDelta
	// 	: openPriceNum - feesDelta;
	
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