import { formatAmount } from "../../views/gmx-test/lib/legacy";


export const getSlTpFromPercentage = (isLong, isTP, percentage, openPriceNum, leverage, fees) => {
	if (!percentage) {
		return 0;
	}

	const feesDelta = formatAmount(fees, 30, 30, 0) / leverage;
	const openPriceWithFees = isLong
		? openPriceNum + feesDelta
		: openPriceNum - feesDelta;
	
	if ((isTP && isLong) || (!isTP && !isLong)) {
		return (
			(
				openPriceWithFees + (0.01 * openPriceWithFees * (percentage / leverage))
			) * 10**10
		).toFixed(0);
	} else {
		return (
			(
				openPriceWithFees - (0.01 * openPriceWithFees * (percentage / leverage))
			) * 10**10
		).toFixed(0);
	}
}