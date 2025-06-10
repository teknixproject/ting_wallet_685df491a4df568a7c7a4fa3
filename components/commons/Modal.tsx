'use client';

import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

const Modal = ({ isOpen, onClose, children, ...props }: any) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const appRoot = document.getElementById('__next');
      if (appRoot) {
        ReactModal.setAppElement(appRoot);
      }
    }
  }, []);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          background: 'lightblue',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '500px',
          margin: 'auto',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      }}
      {...props}
    >
      {children}
      <button onClick={onClose}>Đóng</button>
    </ReactModal>
  );
};

export default Modal;
