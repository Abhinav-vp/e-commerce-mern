import React from 'react';
import { useModal } from '../../context/ModalContext';
import './Modal.css';

const Modal = () => {
    const { modal, hideModal } = useModal();

    if (!modal.isOpen) return null;

    const handleConfirm = () => {
        if (modal.onConfirm) modal.onConfirm();
        hideModal();
    };

    const handleCancel = () => {
        if (modal.onCancel) modal.onCancel();
        hideModal();
    };

    return (
        <div className="modal-overlay" onClick={hideModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{modal.title || (modal.type === 'confirm' ? 'Confirm' : 'Notice')}</h2>
                    <button className="modal-close" onClick={hideModal}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{modal.message}</p>
                </div>
                <div className="modal-footer">
                    {modal.type === 'confirm' && (
                        <button className="modal-btn modal-btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                    <button className="modal-btn modal-btn-primary" onClick={handleConfirm}>
                        {modal.type === 'confirm' ? 'Confirm' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
