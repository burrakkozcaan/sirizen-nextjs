"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

export type NotificationType = 'order' | 'price_drop' | 'flash_sale' | 'stock' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  imageUrl?: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  priceDrops: boolean;
  flashSales: boolean;
  stockAlerts: boolean;
  browserNotifications: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  permissionStatus: NotificationPermission | 'default';
}

type NotificationsAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'read' | 'createdAt'> }
  | { type: 'MARK_AS_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<NotificationPreferences> }
  | { type: 'SET_PERMISSION_STATUS'; payload: NotificationPermission }
  | { type: 'LOAD_NOTIFICATIONS'; payload: NotificationsState };

interface NotificationsContextType extends NotificationsState {
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  setPermissionStatus: (status: NotificationPermission) => void;
  getUnreadCount: () => number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function showBrowserNotification(notification: Notification) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
    });

    browserNotif.onclick = () => {
      window.focus();
      if (notification.link) {
        window.location.href = notification.link;
      }
      browserNotif.close();
    };
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const notification = action.payload;
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        createdAt: new Date(),
      };

      const updated = [newNotification, ...state.notifications].slice(0, 50); // Keep last 50

      // Show browser notification if enabled
      if (state.preferences.browserNotifications && state.permissionStatus === 'granted') {
        showBrowserNotification(newNotification);
      }

      return {
        ...state,
        notifications: updated,
      };
    }

    case 'MARK_AS_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };
    }

    case 'MARK_ALL_AS_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    }

    case 'REMOVE_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload.id),
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
      };
    }

    case 'UPDATE_PREFERENCES': {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    }

    case 'SET_PERMISSION_STATUS': {
      return {
        ...state,
        permissionStatus: action.payload,
      };
    }

    case 'LOAD_NOTIFICATIONS': {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: NotificationsState = {
  notifications: [],
  preferences: {
    orderUpdates: true,
    priceDrops: true,
    flashSales: true,
    stockAlerts: true,
    browserNotifications: false,
  },
  permissionStatus: typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'default',
};

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications-storage');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert createdAt strings back to Date objects
          if (parsed.notifications) {
            parsed.notifications = parsed.notifications.map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            }));
          }
          dispatch({ type: 'LOAD_NOTIFICATIONS', payload: parsed });
        } catch (error) {
          console.error('Failed to load notifications from localStorage:', error);
        }
      }
    }
  }, []);

  // Save notifications to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications-storage', JSON.stringify({
        notifications: state.notifications,
        preferences: state.preferences,
      }));
    }
  }, [state.notifications, state.preferences]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: { id } });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<NotificationPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const setPermissionStatus = useCallback((status: NotificationPermission) => {
    dispatch({ type: 'SET_PERMISSION_STATUS', payload: status });
  }, []);

  const getUnreadCount = useCallback(() => {
    return state.notifications.filter((n) => !n.read).length;
  }, [state.notifications]);

  const value: NotificationsContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences,
    setPermissionStatus,
    getUnreadCount,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

