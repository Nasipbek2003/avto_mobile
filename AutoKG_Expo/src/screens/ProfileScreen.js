import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import {Image} from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import {useToast} from '../context/ToastContext';
import {api, getImageUrl} from '../config/api';
import {useFocusEffect} from '@react-navigation/native';

const ProfileScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {showToast} = useToast();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  // Обновляем профиль при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndLoadProfile();
    }, [])
  );

  const checkAuthAndLoadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        await loadProfile();
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

  const loadProfile = async () => {
    try {
      const [profileData, adsData] = await Promise.all([
        api.getProfile(),
        api.getUserListings(),
      ]);
      
      setUser(profileData);
      setMyAds(adsData);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (isAuthenticated) {
      loadProfile();
    } else {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const formatRating = (rating) => {
    if (!rating || rating === null || rating === undefined) return '0.0';
    const numRating = Number(rating);
    if (isNaN(numRating)) return '0.0';
    return numRating.toFixed(1);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setMyAds([]);
      showToast('Вы вышли из аккаунта', 'success');
    } catch (error) {
      console.error('Ошибка выхода:', error);
      showToast('Ошибка при выходе', 'error');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleEditListing = (listing) => {
    navigation.navigate('NewListing', { editMode: true, listing });
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await api.deleteListing(listingId);
      setMyAds(myAds.filter(ad => ad.id !== listingId));
      showToast('Объявление удалено', 'success');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showToast('Не удалось удалить объявление', 'error');
    }
  };

  const getAdImageUrl = (ad) => {
    if (ad.photos && ad.photos.length > 0) {
      const photos = typeof ad.photos === 'string' ? JSON.parse(ad.photos) : ad.photos;
      return photos[0];
    }
    return null;
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
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatarContainer}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.guestTitle}>Добро пожаловать в Auto.KG!</Text>
          <Text style={styles.guestSubtitle}>
            Войдите в аккаунт, чтобы размещать объявления и общаться с продавцами
          </Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.loginButtonText}>Войти</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleLogin}
            >
              <Ionicons name="person-add-outline" size={20} color="#7c3aed" style={{marginRight: 8}} />
              <Text style={styles.registerButtonText}>Регистрация</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.guestFeatures}>
          <Text style={styles.featuresTitle}>Что вы можете делать:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color="#7c3aed" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Просматривать объявления</Text>
              <Text style={styles.featureDescription}>Ищите и изучайте автомобили без регистрации</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#7c3aed" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Сохранять в избранное</Text>
              <Text style={styles.featureDescription}>Добавляйте понравившиеся авто в избранное</Text>
            </View>
          </View>
          
          <Text style={styles.featuresTitle} style={{marginTop: 24}}>После входа станет доступно:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="add-circle" size={24} color="#999" />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, {color: '#999'}]}>Размещение объявлений</Text>
              <Text style={[styles.featureDescription, {color: '#999'}]}>Продавайте свои автомобили</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color="#999" />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, {color: '#999'}]}>Чаты с продавцами</Text>
              <Text style={[styles.featureDescription, {color: '#999'}]}>Общайтесь напрямую с владельцами</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Экран для авторизованных пользователей (оригинальный код)
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#7c3aed']}
          tintColor="#7c3aed"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar_url ? (
            <Image
              source={{uri: getImageUrl(user.avatar_url)}}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Ionicons name="person" size={48} color="#fff" />
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.phone && (
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.phoneText}>{user.phone}</Text>
          </View>
        )}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#fbbf24" />
          <Text style={styles.ratingText}>
            {formatRating(user?.rating)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={18} color="#fff" style={{marginRight: 6}} />
          <Text style={styles.editButtonText}>Редактировать профиль</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мои объявления ({myAds.length})</Text>
        {myAds.length === 0 ? (
          <Text style={styles.emptyText}>У вас пока нет объявлений</Text>
        ) : (
          myAds.map(ad => {
            const imageUrl = getAdImageUrl(ad);
            return (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adImage}>
                  {imageUrl ? (
                    <Image
                      source={{uri: imageUrl}}
                      style={styles.image}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <Ionicons name="car-sport" size={40} color="#999" />
                  )}
                </View>
                <View style={styles.adInfo}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adPrice}>${ad.price?.toLocaleString()}</Text>
                  <View style={styles.adMeta}>
                    <View style={styles.statusContainer}>
                      <Ionicons 
                        name={ad.status === 'active' ? 'checkmark-circle' : ad.status === 'sold' ? 'close-circle' : 'time'} 
                        size={14} 
                        color={ad.status === 'active' ? '#4ade80' : ad.status === 'sold' ? '#f87171' : '#fbbf24'} 
                      />
                      <Text style={[
                        styles.adStatus,
                        ad.status === 'active' && styles.statusActive,
                        ad.status === 'sold' && styles.statusSold,
                      ]}>
                        {ad.status === 'active' ? 'Активно' : 
                         ad.status === 'sold' ? 'Продано' : 'На модерации'}
                      </Text>
                    </View>
                    <Text style={styles.adDate}>
                      {new Date(ad.created_at).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <View style={styles.adActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditListing(ad)}
                    >
                      <Ionicons name="create-outline" size={18} color="#7c3aed" />
                      <Text style={styles.actionButtonText}>Редактировать</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteListing(ad.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Удалить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Настройки</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, {color: '#ef4444'}]}>Выйти</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  guestHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 32,
  },
  guestAvatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
  },
  registerButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  guestFeatures: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Оригинальные стили для авторизованных пользователей
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  adImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  adInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  adPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  adMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActive: {
    color: '#4ade80',
  },
  statusSold: {
    color: '#f87171',
  },
  adDate: {
    fontSize: 12,
    color: '#999',
  },
  adActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7c3aed',
    gap: 4,
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 100 : 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
