import React from 'react';
import Modal from './Modal';
import Button from '../button/Button';
import Loader from './../loader/Loader';
import Form from './../../Form';
import icon_usdc from '../../../img/icon-usdc.svg';

const RegisterModal = (props) => {
	const {
		visible, 
		setVisible, 
		onRegisterClick, 
		onApproveClick, 
		curStep, 
		isLoading,
		depositVal,
		setDepositVal
	} = props;
	
	function getDepositText() {
		return 'Approve';
	}
	
	const steps = [
		{
			name: 'Create Account',
			title: 'Create Margin Account',
			body: <div className="modal__text">
							<p>DeDeLend Margin Account is a derivative product based on Spot and Perpetual trading. It allows you to use assets in your Margin Account as collateral to borrow additional funds from DeDeLend in order to open positions larger than your wallet balance, with up to 5x leverage.</p>
							<p>With DeDeLend Margin Account, all assets in your Account can be used as collateral to prevent your Position from being liquidated. When the risk level of your Margin Account reaches a level that triggers liquidation, the system will automatically sell the collateral assets to repay the borrowings in your Account.</p>
							<p className='text-inline'><a href="#">Read more</a> about DeDeLend Margin Account</p>
						</div>,
			btn: <Button btnActive={true} onClick={onRegisterClick}>Create Margin Account</Button>,
		},
		{
			name: 'Deposit',
			title: 'Deposit',
			body: '',
			btn:  <Form
							className='modal__form-wrapper'
							inputProps={{
								val: depositVal,
								setVal: setDepositVal,
								placeholder: 'Amount',
							}}
							btnIsActive={true}
							onSubmit={onApproveClick}
							btnText={getDepositText()}
							currency={{
								text: 'USDC',
								icon: icon_usdc
							}}
						>
							<Button className="btn_stroke">Start Trading</Button>
						</Form>,
		},
	]

	const step = steps[curStep];
	
	return (
		<Modal visible={visible} setVisible={setVisible} className="modal_register">
			<div className="modal__steps steps">
				{steps.map((el, i) => {
					return (
						<div className={curStep === i ? 'modal__step step current' : 'modal__step step'} key={i}>
							{el.name}
						</div>
					)
				})}
			</div>
			<h1 className='modal__title'>{step.title}</h1>
			<div className="modal__body">
				{step.body}
				{isLoading ? <Loader /> : step.btn}
			</div>
		</Modal>
	);
};

export default RegisterModal;