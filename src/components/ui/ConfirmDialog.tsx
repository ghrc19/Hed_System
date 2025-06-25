import React from 'react';
import Dialog from './Dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showConfirmButtons
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
    >
      <p className="text-gray-700 dark:text-gray-300">
        {message}
      </p>
    </Dialog>
  );
};

export default ConfirmDialog;