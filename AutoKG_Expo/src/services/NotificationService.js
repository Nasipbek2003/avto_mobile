import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Настройка поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Инициализация сервиса уведомлений
  async initialize() {
    try {
      // Регистрируем для пуш-уведомлений
      const token = await this.registerForPushNotificationsAsync();
      this.expoPushToken = token;

      console.log('Push token получен:', token);

      // Сохраняем токен локально
      if (token) {
        await AsyncStorage.setItem('expoPushToken', token);
      }

      // Настраиваем слушатели
      this.setupNotificationListeners();

      return token;
    } catch (error) {
      console.error('Ошибка инициализации уведомлений:', error);
      
      // Для разработки создаем фиктивный токен
      const fallbackToken = `DevToken[${Date.now()}]`;
      this.expoPushToken = fallbackToken;
      await AsyncStorage.setItem('expoPushToken', fallbackToken);
      this.setupNotificationListeners();
      
      return fallbackToken;
    }
  }

  // Регистрация для пуш-уведомлений
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Разрешение на уведомления не получено');
        return null;
      }
      
      try {
        // Пробуем получить токен с projectId из app.json
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || 'autokg-project-id-12345',
        })).data;
      } catch (error) {
        console.log('Ошибка получения Expo push token:', error);
        // Для разработки можем использовать фиктивный токен
        token = `ExponentPushToken[development-${Date.now()}]`;
      }
    } else {
      console.log('Необходимо физическое устройство для пуш-уведомлений');
      // Для эмулятора используем фиктивный токен
      token = `ExponentPushToken[simulator-${Date.now()}]`;
    }

    return token;
  }

  // Настройка слушателей уведомлений
  setupNotificationListeners() {
    // Слушатель входящих уведомлений
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получено уведомление:', notification);
      // Здесь можно обновить счетчик непрочитанных сообщений
      this.handleNotificationReceived(notification);
    });

    // Слушатель нажатий на уведомления
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Нажатие на уведомление:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Обработка полученного уведомления
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    if (data?.type === 'new_message') {
      // Обновляем счетчик непрочитанных сообщений
      this.updateUnreadCount();
    }
  }

  // Обработка нажатия на уведомление
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    if (data?.type === 'new_message' && data?.chatId) {
      // Навигация к чату (будет реализована в App.js)
      this.navigateToChat(data.chatId);
    }
  }

  // Обновление счетчика непрочитанных
  async updateUnreadCount() {
    try {
      // Получаем текущий счетчик
      const currentCount = await AsyncStorage.getItem('unreadMessagesCount');
      const newCount = (parseInt(currentCount) || 0) + 1;
      
      // Сохраняем новый счетчик
      await AsyncStorage.setItem('unreadMessagesCount', newCount.toString());
      
      // Обновляем badge на иконке приложения
      await Notifications.setBadgeCountAsync(newCount);
      
      return newCount;
    } catch (error) {
      console.error('Ошибка обновления счетчика:', error);
      return 0;
    }
  }

  // Сброс счетчика непрочитанных
  async clearUnreadCount() {
    try {
      await AsyncStorage.setItem('unreadMessagesCount', '0');
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Ошибка сброса счетчика:', error);
    }
  }

  // Получение текущего счетчика
  async getUnreadCount() {
    try {
      const count = await AsyncStorage.getItem('unreadMessagesCount');
      return parseInt(count) || 0;
    } catch (error) {
      console.error('Ошибка получения счетчика:', error);
      return 0;
    }
  }

  // Отправка токена на сервер
  async sendTokenToServer(token) {
    try {
      const { api } = require('../config/api');
      await api.sendPushToken(token);
      console.log('Токен успешно отправлен на сервер');
    } catch (error) {
      console.error('Ошибка отправки токена:', error);
    }
  }

  // Локальное уведомление (для тестирования)
  async scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  }

  // Симуляция push уведомления для разработки
  async simulatePushNotification(title, body, data = {}) {
    console.log('Симуляция push уведомления:', { title, body, data });
    
    // Показываем локальное уведомление
    await this.scheduleLocalNotification(title, body, data);
    
    // Обновляем счетчик если это сообщение
    if (data.type === 'new_message') {
      await this.updateUnreadCount();
    }
  }

  // Очистка слушателей
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Навигация к чату (будет переопределена в App.js)
  navigateToChat(chatId) {
    // Эта функция будет переопределена в App.js
    console.log('Навигация к чату:', chatId);
  }
}

export default new NotificationService();