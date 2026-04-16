import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import socketService from '../services/socketService';
import {api} from '../config/api';

const ChatScreen = ({route, navigation}) => {
  const {chatId, otherUser, listing} = route.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [currentUserId, setCurrentUserId] = useState(null);
  const scrollViewRef = useRef();
  const pollIntervalRef = useRef(null);

  // Шаблонные сообщения
  const quickReplies = [
    '👋 Здравствуйте! Интересует ваше объявление',
    '💰 Какая окончательная цена?',
    '📍 Где можно посмотреть?',
    '🔧 Какое техническое состояние?',
    '📄 Есть ли документы?',
    '🚗 Возможен ли обмен?',
  ];

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    connectWebSocket();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (currentChatId) {
        socketService.leaveChat(currentChatId);
        socketService.offNewMessage();
      }
    };
  }, [currentChatId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
        console.log('👤 Текущий пользователь ID:', user.id);
      }
    } catch (error) {
      console.error('Ошибка загрузки текущего пользователя:', error);
    }
  };

  const loadMessages = async () => {
    try {
      if (currentChatId) {
        const data = await api.getMessages(currentChatId);
        setMessages(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      console.log('🔌 Подключение к WebSocket...');
      await socketService.connect();
      
      if (currentChatId) {
        console.log('👥 Присоединение к чату:', currentChatId);
        socketService.joinChat(currentChatId);

        socketService.onNewMessage((newMessage) => {
          console.log('📨 Получено новое сообщение:', newMessage);
          setMessages(prev => {
            // Проверяем, нет ли уже этого сообщения
            if (prev.find(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
      }
    } catch (error) {
      console.error('❌ Ошибка подключения WebSocket:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage('');
    setShowQuickReplies(false);

    try {
      let chatIdToUse = currentChatId;

      // Если нет chatId, создаем новый чат через API
      if (!chatIdToUse && otherUser?.id) {
        console.log('📝 Создание нового чата...');
        const newChat = await api.createChat({
          receiverId: otherUser.id,
          message: messageText,
          listingId: listing?.id || null,
        });
        
        chatIdToUse = newChat.chatId;
        setCurrentChatId(chatIdToUse);
        console.log('✅ Чат создан:', chatIdToUse);
        
        // Подключаемся к WebSocket для нового чата
        socketService.joinChat(chatIdToUse);
        socketService.onNewMessage((newMessage) => {
          console.log('📨 Получено новое сообщение:', newMessage);
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
        
        // Загружаем сообщения
        await loadMessages();
      } else if (chatIdToUse) {
        // Отправляем через WebSocket
        console.log('📤 Отправка через WebSocket...');
        socketService.sendMessage(chatIdToUse, messageText);
      }
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  const sendQuickReply = async (text) => {
    if (!otherUser || !otherUser.id) {
      alert('Ошибка: информация о получателе недоступна');
      return;
    }
    
    setMessage('');
    setShowQuickReplies(false);
    
    try {
      let chatIdToUse = currentChatId;

      // Если нет chatId, создаем новый чат через API
      if (!chatIdToUse) {
        console.log('📝 Создание нового чата с быстрым ответом...');
        const newChat = await api.createChat({
          receiverId: otherUser.id,
          message: text,
          listingId: listing?.id || null,
        });
        
        chatIdToUse = newChat.chatId;
        setCurrentChatId(chatIdToUse);
        console.log('✅ Чат создан:', chatIdToUse);
        
        // Подключаемся к WebSocket для нового чата
        socketService.joinChat(chatIdToUse);
        socketService.onNewMessage((newMessage) => {
          console.log('📨 Получено новое сообщение:', newMessage);
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
        
        // Загружаем сообщения
        await loadMessages();
      } else {
        // Отправляем через WebSocket
        console.log('📤 Отправка быстрого ответа через WebSocket...');
        socketService.sendMessage(chatIdToUse, text);
      }
    } catch (error) {
      console.error('❌ Ошибка отправки быстрого ответа:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Определяем, является ли сообщение моим
  const isMyMessage = (msg) => {
    // Сравниваем sender_id с ID текущего пользователя
    return msg.sender_id === currentUserId;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.sellerName}>{otherUser?.name || 'Чат'}</Text>
          <Text style={styles.onlineStatus}>онлайн</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>

        {messages.length === 0 && showQuickReplies && (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesTitle}>Быстрые сообщения:</Text>
            {quickReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickReplyButton}
                onPress={() => sendQuickReply(reply)}>
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((msg) => {
          const isMine = isMyMessage(msg);
          return (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                isMine ? styles.myMessageWrapper : styles.otherMessageWrapper,
              ]}>
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.myMessage : styles.otherMessage,
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myMessageText : styles.otherMessageText,
                  ]}>
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isMine ? styles.myMessageTime : styles.otherMessageTime,
                  ]}>
                  {formatTime(msg.created_at)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        {!showQuickReplies && messages.length > 0 && (
          <TouchableOpacity 
            style={styles.quickRepliesToggle}
            onPress={() => setShowQuickReplies(!showQuickReplies)}>
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#7c3aed" />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.input}
          placeholder="Сообщение..."
          value={message}
          onChangeText={handleTyping}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4ade80',
    marginTop: 2,
  },
  typingStatus: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 2,
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  quickRepliesContainer: {
    marginBottom: 20,
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickReplyButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickReplyText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  quickRepliesToggle: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#7c3aed',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ChatScreen;
