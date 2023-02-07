import { getExplorerUrl, helperToast } from './../../views/gmx-test/lib/legacy';


export const notifySuccess = (text, hash) => {
	const url = getExplorerUrl(42161) + "tx/" + hash;
	
	helperToast.success(
		<div>
			{text}
			<br />
			{hash &&
				<a href={url} target="_blank" rel="noopener noreferrer">
					View on Arbiscan
				</a>}
			<br />
		</div>
	);
}

export const errAlert = (err, setIsLoading) => {
	const msg = err.reason ?? err.message;
	
	console.log(err);
	// alert(`Error code: ${err.code}\nError message: ${msg}\n\nCheck the console for details.`)
	helperToast.error(
		<div>
			Error: {err.code}
			<br />
			{msg}
			<br /><br />
			Check the console for details.
		</div>
	)

	if (setIsLoading) {
		setIsLoading(false);
	}
}