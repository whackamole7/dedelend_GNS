import { sepToNumber } from "./sepThousands";

export const floor = (num, fraction = 2) => {
	if (typeof num !== 'number') {
		return '...'
	}
	
	return Math.floor(num * 10**fraction) / 10**fraction;
}


export const formatForContract = (val, fraction = 6) => {
	return Math.floor(sepToNumber(val) * 10**fraction);
}