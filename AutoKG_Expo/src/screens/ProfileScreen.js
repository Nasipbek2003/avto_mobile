import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Image} from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import {useToast} from '../context/ToastContext';
import {api} from '../config/api';

const ProfileScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const {showToast} = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
      showToast('Ошибка при выходе', 'error');
    }
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

  const getImageUrl = (ad) => {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#fbbf24" />
          <Text style={styles.ratingText}>{user?.rating ? Number(user.rating).toFixed(1) : '5.0'}</Text>
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
            const imageUrl = getImageUrl(ad);
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
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('LanguageSelect')}
        >
          <Ionicons name="language-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Язык</Text>
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
    marginBottom: 12,
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
