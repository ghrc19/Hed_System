import React, { useState, useEffect, useCallback } from 'react';
import Notification from '../ui/Notification';
import { create } from 'zustand';
import { NotificacionProps } from '../../types';

interface NotificationStore {
  notifications: NotificacionProps[];
  addNotification: (notification: NotificacionProps) => void;
  removeNotification: (index: number) => void;
}

export const useNotification = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [...state.notifications, notification] 
    })),
  removeNotification: (index) => 
    set((state) => ({ 
      notifications: state.notifications.filter((_, i) => i !== index) 
    })),
}));

const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <>
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          mensaje={notification.mensaje}
          tipo={notification.tipo}
          onClose={() => removeNotification(index)}
        />
      ))}
    </>
  );
};

export default NotificationManager;

// Métodos de ayuda para usar fuera del componente
export const showSuccess = (mensaje: string) => {
  useNotification.getState().addNotification({
    mensaje,
    tipo: 'success'
  });
};

export const showError = (mensaje: string) => {
  useNotification.getState().addNotification({
    mensaje,
    tipo: 'error'
  });
};

export const showInfo = (mensaje: string) => {
  useNotification.getState().addNotification({
    mensaje,
    tipo: 'info'
  });
};