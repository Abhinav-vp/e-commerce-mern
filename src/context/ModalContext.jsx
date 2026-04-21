import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // 'alert' or 'confirm'
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
    });

    const showModal = ({ type = 'alert', title = '', message = '', onConfirm = null, onCancel = null }) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            onConfirm,
            onCancel,
        });
    };

    const hideModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal, modal }}>
            {children}
        </ModalContext.Provider>
    );
};
