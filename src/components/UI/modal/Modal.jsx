import React from 'react';
import cx from 'classnames';

const Modal = (props) => {
	const {
		children, 
		className, 
		visible, 
		setVisible, 
		resetModal, 
		isObligatory
	} = props;
	
	const classes = cx('modal', className, visible && 'active');

	const closeModal = () => {
		if (isObligatory) {
			return;
		}
		
		setVisible(false)
		
		if (resetModal) {
			resetModal()
		}
	}
	
	return (
		<div className={classes} onMouseDown={closeModal}>
			<div className="modal__content-wrapper">
				<div className="modal__content" onMouseDown={e => e.stopPropagation()}>
					{children}
				</div>
			</div>
			{!isObligatory && 
				<button className="close-btn" onClick={closeModal}></button>}
		</div>
	);
};

export default Modal;