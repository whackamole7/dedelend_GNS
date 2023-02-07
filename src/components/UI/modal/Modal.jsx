import React from 'react';

const Modal = ({children, className, visible, setVisible, resetModal, isObligatory}) => {
	const classes = ['modal', className]

	
	if (visible) {
		classes.push('active')
	}

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
		<div className={classes.join(' ')} onMouseDown={closeModal}>
			<div className="modal__content-wrapper">
				<div className="modal__content" onMouseDown={e => e.stopPropagation()}>
					{children}
				</div>
			</div>
			{isObligatory ?
				"" : <button className="close-btn" onClick={closeModal}></button>}
		</div>
	);
};

export default Modal;