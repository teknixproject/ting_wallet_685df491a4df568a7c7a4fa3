import { useEffect } from 'react';
import ReactModal from 'react-modal';

interface ModalProps {
  data: any;
  isOpen?: boolean;
  onClose?: () => void;
  children?: any;
  [key: string]: unknown;
}

const Modal = ({ isOpen, onClose, children, ...props }: ModalProps) => {
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
      isOpen={isOpen || false}
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
