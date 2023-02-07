export const separateThousands = (num, symb = ",") => {
	if (typeof num === 'undefined' || num === null) {
		return '';
	}
	
	const str = num.toString();
	let [intPart, fractionPart] = str.split('.')
	const hasFraction = fractionPart !== undefined;

	intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, hasFraction ? ',' : symb)
	
	if (hasFraction) {
		if (fractionPart.length === 1 && symb !== ' ') {
			fractionPart += '0'
		}
		
		return intPart + '.' + fractionPart
	} else {
		return intPart;
	}
}


const removeNonNumeric = (num) => {
	let result = num.toString().replace(/^\./g, '').replace(/[^0-9.]/g, '').replace(/^0\d/, '')

	if (result.match(/\./g)?.length > 1) {
		result = result.replace(/\.$/, '')
	}

	let [, fractionPart] = result.split('.')

	if (fractionPart?.length > 6) {
		result = result.substr(0, result.length - 1)
	}
	
	return result;
}

export const convertInputNum = (num) => {
	return separateThousands(removeNonNumeric(num), ' ')
}


export const sepToNumber = (str, symb = ' ') => {
	if (typeof str !== 'string') {
		return str;
	}
	
	return Number(str.split(symb).join(''));
}