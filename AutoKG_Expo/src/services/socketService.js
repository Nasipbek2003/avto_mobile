import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) {
      console.log('Socket уже подключен');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      // Замените на ваш IP адрес
      const SOCKET_URL = 'http://172.20.10.2:3000';
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket подключен');
        this.connected = true;
        this.socket.emit('authenticate', token);
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Аутентификация успешна:', data.userId);
      });

      this.socket.on('authentication_error', (data) => {
        console.error('❌ Ошибка аутентификации:', data.error);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket отключен');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Ошибка подключения:', error);
      });

    } catch (error) {
      console.error('❌ Ошибка подключения к WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('🔌 WebSocket отключен вручную');
    }
  }

  // Присоединиться к чату
  joinChat(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_chat', chatId);
      console.log(`👥 Присоединение к чату ${chatId}`);
    }
  }

  // Покинуть чат
  leaveChat(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_chat', chatId);
      console.log(`👋 Выход из чата ${chatId}`);
    }
  }

  // Отправить сообщение
  sendMessage(chatId, content) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', { chatId, content });
      console.log(`💬 Отправка сообщения в чат ${chatId}`);
    } else {
      console.error('❌ Socket не подключен');
    }
  }

  // Слушать новые сообщения
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Отписаться от новых сообщений
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  // Индикатор "печатает..."
  startTyping(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.connected) {
      this.socket.emit('stop_typing', { chatId });
    }
  }

  // Слушать индикатор печати
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  // Проверка подключения
  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
