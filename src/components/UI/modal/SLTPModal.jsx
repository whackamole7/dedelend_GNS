import React from 'react';
import Modal from './../../../views/gmx-test/components/Modal/Modal';

const SLTPModal = (props) => {
	const {
		visible,
		setVisible,
		onClick,
		title,
	} = props;

	return (
		<Modal
			className="SLTP"
			visible={visible}
			setVisible={setVisible}
		>
			<h1 className="modal__title">{title}</h1>
			<div className="modal__body">

			</div>
		</Modal>
	);
};

export default SLTPModal;