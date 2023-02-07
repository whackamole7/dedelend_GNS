import React, { useState, useEffect } from 'react';
import NumberInput from './UI/input/NumberInput';
import Button from './UI/button/Button';

const Form = ({children, maxVal, inputProps, btnText, btnIsActive, onSubmit, modalVisible, currency, ...props}) => {

	const [state, setState] = useState({class: '', msg: ''});
	
	let [val, setVal] = useState('')
	if (inputProps.state) {
		val = inputProps.state.val
		setVal = inputProps.state.setVal
	}

	const [btnActive, setBtnActive] = useState(false)

	useEffect(() => {
		if (!modalVisible) {
			setState({
				class: '',
				msg: ''
			});
			setVal('')
		}
	}, [modalVisible])
	
	return (
		<form className={props.className} action="post" onSubmit={((e) => {
			e.preventDefault()
			
			const validateForm = () => {
				if (!val) {
					e.preventDefault()
	
					setState({
						class: 'error',
						msg: 'Empty field'
					})
				} else {
					if(Number(val.toString().split('.').join('')) === 0) {
						e.preventDefault()

						setState({
							class: 'error',
							msg: ''
						})
					} else if(val.toString().split(' ').join('') > maxVal) {
						e.preventDefault()
						
						setState({
							class: 'error',
							msg: props.maxWarningMsg ?? 'Insufficient balance'
						})
					} else {
						setState({
							class: '',
							msg: ''
						})

						onSubmit(e)
					}
				}
			}
			
			if (inputProps.disabled) {
				onSubmit(e)
			} else {
				validateForm()
			}
		})}>
			<div className='form-field'>
				<div className="input-container">
					<NumberInput value={val} setValue={setVal} {...inputProps} className={state.class} msg={state.msg} setBtnActive={setBtnActive}></NumberInput>
					{props.isModal ?
						<Button
							type="button"
							className="btn_plain"
							disabled={inputProps.disabled}
							onClick={props.maxOnClick}
						>
							Max
						</Button>
						: ''}
					{currency ?
						<Button
							type="button"
							className="btn_plain currency-label"
							disabled={true}
						>
							<img src={currency.icon} alt={currency.text + ' icon'} />
							{currency.text}
						</Button>
						: ''}
				</div>
				<Button btnActive={btnActive || btnIsActive} disabled={props.btnIsDisabled} className="submit-btn">{btnText}</Button>
			</div>
			{children}
		</form>
	);
};

export default Form;