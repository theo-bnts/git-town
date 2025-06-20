'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationCard } from '@/app/components/ui/NotificationCard';

const NotificationContext = createContext({ notify: () => {} });

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  const clear = useCallback(() => {
    setNotification({ message: '', type: 'success' });
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationCard
        message={notification.message}
        type={notification.type}
        onClear={clear}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) 
    throw new Error('useNotification doit être utilisé à l\'intérieur de NotificationProvider');
  return ctx.notify;
}
