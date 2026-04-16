import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useUnreadMessages} from '../context/UnreadMessagesContext';
import {api} from '../config/api';

const ChatsScreen = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { clearUnreadCount } = useUnreadMessages();

  useEffect(() => {
    checkAuthAndLoadChats();
  }, []);

  // Автообновление при возврате на экран и сброс счетчика
  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndLoadChats();
      // Сбрасываем счетчик непрочитанных при открытии экрана чатов
      if (isAuthenticated) {
        clearUnreadCount();
      }
    }, [isAuthenticated])
  );

  const checkAuthAndLoadChats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        await loadChats();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      // Если ошибка авторизации, сбрасываем токен
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isAuthenticated) {
      loadChats();
    } else {
      setRefreshing(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', {
      chatId: chat.id,
      otherUser: {
        id: chat.other_user_id,
        name: chat.other_user_name,
      },
      listing: chat.listing_id ? {
        id: chat.listing_id,
        title: chat.listing_title,
      } : null,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // Экран для неавторизованных пользователей
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Чаты</Text>
          <View style={{width: 32}} />
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#7c3aed" />
          </View>
          
          <Text style={styles.guestTitle}>Войдите, чтобы общаться</Text>
          <Text style={styles.guestSubtitle}>
            Для общения с продавцами и покупателями необходимо войти в аккаунт
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>Безопасное общение</Text>
            </View>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="notifications" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>Уведомления о сообщениях</Text>
            </View>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="time" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>История переписки</Text>
            </View>
          </View>

          <View style={styles.guestButtons}>
            <TouchableOpacity 
              style={styles.guestLoginButton}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.guestLoginButtonText}>Войти в аккаунт</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.guestRegisterButton}
              onPress={handleLogin}
            >
              <Ionicons name="person-add-outline" size={20} color="#7c3aed" style={{marginRight: 8}} />
              <Text style={styles.guestRegisterButtonText}>Создать аккаунт</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Нет активных чатов</Text>
          <Text style={styles.emptySubtext}>
            Начните общение с продавцами
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {chats.map(chat => (
            <TouchableOpacity 
              key={chat.id} 
              style={styles.chatCard}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={32} color="#7c3aed" />
                </View>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.other_user_name || 'Пользователь'}</Text>
                  <Text style={styles.chatTime}>{formatTime(chat.last_message_time)}</Text>
                </View>
                {chat.listing_title && (
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    📋 {chat.listing_title}
                  </Text>
                )}
                <View style={styles.messageRow}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.last_message || 'Нет сообщений'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
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
  // Стили для неавторизованных пользователей
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestIconContainer: {
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  guestFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  guestFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  guestFeatureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  guestButtons: {
    width: '100%',
    gap: 12,
  },
  guestLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
  },
  guestLoginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestRegisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
  },
  guestRegisterButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  // Оригинальные стили
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 4,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  listingTitle: {
    fontSize: 12,
    color: '#7c3aed',
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
});

export default ChatsScreen;
