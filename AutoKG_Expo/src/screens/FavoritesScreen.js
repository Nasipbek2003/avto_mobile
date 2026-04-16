import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '../config/api';

const FavoritesScreen = ({navigation}) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, []);

  // Автообновление при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndLoadFavorites();
    }, [])
  );

  const checkAuthAndLoadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        await loadFavorites();
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

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      // Если ошибка авторизации, сбрасываем токен
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setIsAuthenticated(false);
        setFavorites([]);
      } else if (!refreshing) {
        Alert.alert('Ошибка', 'Не удалось загрузить избранное');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await api.removeFavorite(listingId);
      setFavorites(favorites.filter(item => item.id !== listingId));
      Alert.alert('Успешно', 'Удалено из избранного');
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
      Alert.alert('Ошибка', 'Не удалось удалить из избранного');
    }
  };

  const handleCardPress = (item) => {
    navigation.navigate('ListingDetail', {listing: item});
  };

  const getImageUrl = (item) => {
    if (item.photos && item.photos.length > 0) {
      const photos = typeof item.photos === 'string' ? JSON.parse(item.photos) : item.photos;
      return photos[0];
    }
    return null;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    return diffDays === 0 ? 'Сегодня' : `${diffDays} дн назад`;
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
          <Text style={styles.headerTitle}>Избранное</Text>
          <View style={{width: 32}} />
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="heart-outline" size={80} color="#7c3aed" />
          </View>
          
          <Text style={styles.guestTitle}>Войдите, чтобы сохранять избранное</Text>
          <Text style={styles.guestSubtitle}>
            Создайте аккаунт, чтобы сохранять понравившиеся объявления и получать к ним быстрый доступ
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="bookmark" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>Сохранение избранных авто</Text>
            </View>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="sync" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>Синхронизация между устройствами</Text>
            </View>
            <View style={styles.guestFeatureItem}>
              <Ionicons name="notifications" size={24} color="#4ade80" />
              <Text style={styles.guestFeatureText}>Уведомления об изменениях цен</Text>
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
        <Text style={styles.headerTitle}>Избранное</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Нет избранных объявлений</Text>
          <Text style={styles.emptySubtext}>
            Добавляйте понравившиеся объявления в избранное
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#7c3aed']}
              tintColor="#7c3aed"
            />
          }
          showsVerticalScrollIndicator={false}>
          {favorites.map(item => {
            const imageUrl = getImageUrl(item);
            return (
              <TouchableOpacity
                key={item.id} 
                style={styles.favoriteCard}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.7}>
                <View style={styles.imageContainer}>
                  {imageUrl ? (
                    <Image
                      source={{uri: imageUrl}}
                      style={styles.image}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <Ionicons name="car-sport" size={48} color="#999" />
                  )}
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.price}>${item.price?.toLocaleString()}</Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.details}>
                      {item.year} • {item.mileage?.toLocaleString()} км
                    </Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.location}>{item.region_name || 'Не указан'}</Text>
                  </View>
                  <Text style={styles.date}>{formatTimeAgo(item.created_at)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(item.id);
                  }}>
                  <Ionicons name="heart" size={28} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
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
    padding: 60,
    alignItems: 'center',
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
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
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
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  detailsRow: {
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  heartButton: {
    padding: 8,
  },
});

export default FavoritesScreen;
