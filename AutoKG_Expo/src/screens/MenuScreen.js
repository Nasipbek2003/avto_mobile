import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api, getImageUrl} from '../config/api';
import {useFocusEffect} from '@react-navigation/native';
import NotificationService from '../services/NotificationService';

const MenuScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const profile = await api.getProfile();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        {text: 'Отмена', style: 'cancel'},
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            Alert.alert('Успешно', 'Вы вышли из аккаунта');
          },
        },
      ]
    );
  };

  const formatRating = (rating) => {
    if (!rating || rating === null || rating === undefined) return '0.0';
    const numRating = Number(rating);
    if (isNaN(numRating)) return '0.0';
    return numRating.toFixed(1);
  };

  const menuItems = [
    ...(user ? [
      {
        id: 'profile',
        icon: 'person-outline',
        title: 'Редактировать профиль',
        subtitle: 'Изменить данные профиля',
        onPress: () => navigation.navigate('EditProfile'),
      },
    ] : [
      {
        id: 'login',
        icon: 'person-circle-outline',
        title: 'Login / Register',
        subtitle: 'Войти или создать аккаунт',
        onPress: () => navigation.navigate('Login'),
      },
    ]),
    {
      id: 'search',
      icon: 'search-outline',
      title: 'Search Ads',
      subtitle: 'Поиск объявлений',
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: 'new',
      icon: 'add-circle-outline',
      title: 'New Ads',
      subtitle: 'Создать объявление',
      onPress: async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Требуется авторизация', 'Войдите для создания объявления');
          navigation.navigate('Login');
        } else {
          navigation.navigate('Main', {screen: 'NewListing'});
        }
      },
    },
    {
      id: 'myads',
      icon: 'folder-open-outline',
      title: 'My Ads',
      subtitle: 'Мои объявления',
      onPress: async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Требуется авторизация', 'Войдите для просмотра объявлений');
          navigation.navigate('Login');
        } else {
          navigation.navigate('Main', {screen: 'Profile'});
        }
      },
    },
    {
      id: 'contacts',
      icon: 'mail-outline',
      title: 'Developer Contacts',
      subtitle: 'Связаться с разработчиком',
      onPress: () => {
        Alert.alert(
          'Контакты разработчика',
          'Email: dev@autokg.kg\nTelegram: @autokg_dev\nPhone: +996 XXX XXX XXX',
          [{text: 'OK'}]
        );
      },
    },
    {
      id: 'test-notification',
      icon: 'notifications-outline',
      title: 'Тест уведомлений',
      subtitle: 'Проверить push уведомления',
      onPress: async () => {
        try {
          await NotificationService.simulatePushNotification(
            'Тестовое уведомление',
            'Это тестовое сообщение от AutoKG',
            { type: 'new_message', chatId: '123' }
          );
          Alert.alert('Успешно', 'Тестовое уведомление отправлено!');
        } catch (error) {
          console.error('Ошибка тестирования уведомлений:', error);
          Alert.alert('Ошибка', 'Не удалось отправить уведомление');
        }
      },
    },
    ...(user ? [
      {
        id: 'logout',
        icon: 'log-out-outline',
        title: 'Выйти',
        subtitle: 'Выйти из аккаунта',
        onPress: handleLogout,
      },
    ] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        ) : user ? (
          <View style={styles.profileContainer}>
            <TouchableOpacity 
              style={styles.profileCard}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.avatarWrapper}>
                {user.avatar_url ? (
                  <Image 
                    source={{uri: getImageUrl(user.avatar_url)}} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#7c3aed" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone && (
                  <View style={styles.phoneContainer}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  </View>
                )}
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>
                    {formatRating(user.rating)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="car-sport" size={60} color="#7c3aed" />
            </View>
            <Text style={styles.appName}>Auto.KG</Text>
            <Text style={styles.appTagline}>Маркетплейс автомобилей</Text>
          </View>
        )}

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={26} color="#7c3aed" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.0.0</Text>
          <Text style={styles.footerText}>© 2026 Auto.KG</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#7c3aed',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  menuList: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
});

export default MenuScreen;
