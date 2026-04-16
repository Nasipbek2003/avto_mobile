import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }
  return context;
};

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      return !!token;
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      return false;
    }
  };

  // Загрузка счетчика из AsyncStorage
  const loadUnreadCount = async () => {
    try {
      const count = await AsyncStorage.getItem('unreadMessagesCount');
      const parsedCount = parseInt(count) || 0;
      setUnreadCount(parsedCount);
      return parsedCount;
    } catch (error) {
      console.error('Ошибка загрузки счетчика:', error);
      return 0;
    }
  };

  // Обновление счетчика
  const updateUnreadCount = async (newCount) => {
    try {
      await AsyncStorage.setItem('unreadMessagesCount', newCount.toString());
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Ошибка обновления счетчика:', error);
    }
  };

  // Увеличение счетчика
  const incrementUnreadCount = async () => {
    const newCount = unreadCount + 1;
    await updateUnreadCount(newCount);
    return newCount;
  };

  // Сброс счетчика
  const clearUnreadCount = async () => {
    await updateUnreadCount(0);
  };

  // Загрузка счетчика при инициализации
  useEffect(() => {
    const initializeCount = async () => {
      const authenticated = await checkAuth();
      if (authenticated) {
        await loadUnreadCount();
      } else {
        setUnreadCount(0);
      }
    };

    initializeCount();
  }, []);

  // Обновление при изменении авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const value = {
    unreadCount,
    isAuthenticated,
    loadUnreadCount,
    updateUnreadCount,
    incrementUnreadCount,
    clearUnreadCount,
    checkAuth,
    setIsAuthenticated,
  };

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};