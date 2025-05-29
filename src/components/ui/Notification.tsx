import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationProps {
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ mensaje, tipo, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // espera a que termine la animación
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    info: Info
  }[tipo];
  
  const bgColor = {
    success: 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-200',
    error: 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
    info: 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
  }[tipo];
  
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 flex items-center p-4 border-l-4 rounded shadow-md transition-all duration-300 transform z-50',
        bgColor,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <IconComponent className="w-5 h-5 mr-2" />
      <div className="ml-3 text-sm font-medium">{mensaje}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;