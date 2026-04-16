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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {api, getImageUrl} from '../config/api';

const SellerProfileScreen = ({route, navigation}) => {
  const {sellerId, sellerName} = route.params || {};
  const [seller, setSeller] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  console.log('SellerProfileScreen params:', {sellerId, sellerName});

  useEffect(() => {
    loadCurrentUser();
    loadSellerData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Ошибка загрузки текущего пользователя:', error);
    }
  };

  const loadSellerData = async () => {
    try {
      console.log('Загрузка данных продавца:', sellerId);
      
      if (!sellerId) {
        throw new Error('ID продавца не указан');
      }

      // Загружаем данные по очереди для лучшей отладки
      console.log('Загружаем профиль продавца...');
      let sellerData;
      try {
        sellerData = await api.getSellerProfile(sellerId);
        console.log('Профиль продавца загружен:', sellerData);
      } catch (error) {
        if (error.message.includes('404')) {
          // Пользователь не найден, создаем базовый профиль
          sellerData = {
            id: sellerId,
            name: sellerName || 'Продавец',
            avatar_url: null,
            phone: null,
            rating: 0,
            created_at: new Date().toISOString(),
          };
          console.log('Пользователь не найден, используем базовый профиль');
        } else {
          throw error;
        }
      }
      setSeller(sellerData);

      console.log('Загружаем объявления продавца...');
      let listingsData = [];
      try {
        listingsData = await api.getSellerListings(sellerId);
        console.log('Объявления продавца загружены:', listingsData);
        
        // Проверяем, что получили массив, а не объект с ошибкой
        if (!Array.isArray(listingsData)) {
          console.log('Получен не массив объявлений:', listingsData);
          listingsData = [];
        }
      } catch (error) {
        console.log('Не удалось загрузить объявления:', error.message);
        listingsData = [];
      }
      setSellerListings(listingsData);

      console.log('Загружаем отзывы продавца...');
      let reviewsData = [];
      try {
        reviewsData = await api.getUserReviews(sellerId);
        console.log('Отзывы продавца загружены:', reviewsData);
        
        // Проверяем, что получили массив, а не объект с ошибкой
        if (!Array.isArray(reviewsData)) {
          console.log('Получен не массив отзывов:', reviewsData);
          reviewsData = [];
        }
      } catch (error) {
        console.log('Не удалось загрузить отзывы:', error.message);
        reviewsData = [];
      }
      setReviews(reviewsData);

    } catch (error) {
      console.error('Критическая ошибка загрузки профиля продавца:', error);
      
      // Показываем хотя бы базовую информацию
      setSeller({
        id: sellerId,
        name: sellerName || 'Продавец',
        avatar_url: null,
        phone: null,
        rating: 0,
        created_at: new Date().toISOString(),
      });
      setSellerListings([]);
      setReviews([]);
      
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о продавце');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadSellerData();
  }, []);

  const formatRating = (rating) => {
    if (!rating || rating === null || rating === undefined) return '0.0';
    const numRating = Number(rating);
    if (isNaN(numRating)) return '0.0';
    return numRating.toFixed(1);
  };

  const calculateAverageRating = () => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Math.round(Number(rating));
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= numRating ? 'star' : 'star-outline'}
          size={16}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  const getListingImageUrl = (listing) => {
    if (listing.photos && listing.photos.length > 0) {
      const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos;
      return photos[0];
    }
    return null;
  };

  const handleAddReview = () => {
    if (!currentUserId) {
      Alert.alert('Требуется авторизация', 'Войдите для добавления отзыва');
      return;
    }
    
    if (currentUserId === sellerId) {
      Alert.alert('Ошибка', 'Нельзя оставить отзыв самому себе');
      return;
    }

    navigation.navigate('Reviews', {
      userId: sellerId,
      userName: seller?.name || sellerName,
      canAddReview: true,
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 30) return `${diffDays} дн назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес назад`;
    return `${Math.floor(diffDays / 365)} г назад`;
  };

  const handleStartChat = async () => {
    if (!currentUserId) {
      Alert.alert('Требуется авторизация', 'Войдите для отправки сообщения');
      return;
    }

    if (currentUserId === sellerId) {
      Alert.alert('Ошибка', 'Нельзя написать самому себе');
      return;
    }

    try {
      navigation.navigate('Chat', {
        otherUser: {
          id: sellerId,
          name: seller?.name || sellerName,
        },
      });
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      Alert.alert('Ошибка', 'Не удалось создать чат');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль продавца</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        {/* Информация о продавце */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {seller?.avatar_url ? (
              <Image
                source={{uri: getImageUrl(seller.avatar_url)}}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
                onError={(error) => {
                  console.log('Ошибка загрузки аватара:', error);
                  // Не показываем ошибку пользователю, просто используем иконку по умолчанию
                }}
              />
            ) : (
              <Ionicons name="person" size={60} color="#7c3aed" />
            )}
          </View>
          
          <Text style={styles.sellerName}>{seller?.name || sellerName || 'Продавец'}</Text>
          
          {seller?.phone && (
            <View style={styles.phoneContainer}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.phoneText}>{seller.phone}</Text>
            </View>
          )}
          
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Text style={styles.averageRating}>{calculateAverageRating()}</Text>
              <View style={styles.starsContainer}>
                {renderStars(calculateAverageRating())}
              </View>
              <Text style={styles.reviewCount}>({reviews.length})</Text>
            </View>
          </View>

          <Text style={styles.memberSince}>
            Участник с {new Date(seller?.created_at || Date.now()).toLocaleDateString('ru-RU', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>

          {/* Кнопки действий */}
          {currentUserId && currentUserId !== sellerId && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
                <Ionicons name="chatbubble" size={18} color="#fff" />
                <Text style={styles.chatButtonText}>Написать</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reviewButton} onPress={handleAddReview}>
                <Ionicons name="star-outline" size={18} color="#7c3aed" />
                <Text style={styles.reviewButtonText}>Отзыв</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Объявления продавца */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Объявления ({Array.isArray(sellerListings) ? sellerListings.length : 0})</Text>
          {!Array.isArray(sellerListings) || sellerListings.length === 0 ? (
            <Text style={styles.emptyText}>Нет активных объявлений</Text>
          ) : (
            sellerListings.map(listing => {
              const imageUrl = getListingImageUrl(listing);
              return (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.listingCard}
                  onPress={() => navigation.navigate('ListingDetail', {listing})}
                >
                  <View style={styles.listingImage}>
                    {imageUrl ? (
                      <Image
                        source={{uri: imageUrl}}
                        style={styles.listingImageFull}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <Ionicons name="car-sport" size={40} color="#999" />
                    )}
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
                    <Text style={styles.listingPrice}>${listing.price?.toLocaleString()}</Text>
                    <Text style={styles.listingDetails}>
                      {listing.year} • {listing.mileage?.toLocaleString()} км
                    </Text>
                    <Text style={styles.listingDate}>{formatTimeAgo(listing.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Отзывы */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Отзывы ({Array.isArray(reviews) ? reviews.length : 0})</Text>
          {!Array.isArray(reviews) || reviews.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет отзывов</Text>
          ) : (
            reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Ionicons name="person" size={20} color="#7c3aed" />
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                      <Text style={styles.reviewDate}>{formatTimeAgo(review.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
                {review.listing_title && (
                  <Text style={styles.reviewListing}>По объявлению: {review.listing_title}</Text>
                )}
              </View>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#7c3aed',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  phoneText: {
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageRating: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  reviewButtonText: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 16,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listingImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  listingImageFull: {
    width: '100%',
    height: '100%',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  listingDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  listingDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewListing: {
    fontSize: 12,
    color: '#7c3aed',
    fontStyle: 'italic',
  },
});

export default SellerProfileScreen;