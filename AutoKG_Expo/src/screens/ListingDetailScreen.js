import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {api} from '../config/api';
import Car3DViewer from '../components/Car3DViewer';

const {width} = Dimensions.get('window');

const ListingDetailScreen = ({route, navigation}) => {
  const {listing} = route.params || {
    listing: {
      title: 'Toyota Camry 2020',
      price: 25000,
      location: 'Бишкек',
    },
  };

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [show3D, setShow3D] = useState(false);

  // Демо-изображения (в реальном приложении будут из API)
  const images = ['🚗', '🚙', '🚕', '🚐'];

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.removeFavorite(listing.id);
      } else {
        await api.addFavorite(listing.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Ошибка', 'Необходимо войти в систему');
    }
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      listingId: listing.id,
      sellerId: listing.user_id,
      sellerName: listing.owner_name || 'Продавец',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite}>
          <Text style={styles.heartButton}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageSlide}>
              <Text style={styles.imagePlaceholder}>{img}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentImageIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.threeDButton}
          onPress={() => setShow3D(!show3D)}>
          <Text style={styles.threeDButtonText}>
            {show3D ? '📷 Фото' : '🔄 3D'}
          </Text>
        </TouchableOpacity>
      </View>

      {show3D && (
        <Car3DViewer carModel={listing.brand} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${listing.price?.toLocaleString()}</Text>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Детали автомобиля</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Марка:</Text>
            <Text style={styles.detailValue}>{listing.brand || 'Не указано'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Модель:</Text>
            <Text style={styles.detailValue}>{listing.model || 'Не указано'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Год:</Text>
            <Text style={styles.detailValue}>{listing.year || 'Не указано'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Пробег:</Text>
            <Text style={styles.detailValue}>
              {listing.mileage ? `${listing.mileage.toLocaleString()} км` : 'Не указано'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Двигатель:</Text>
            <Text style={styles.detailValue}>{listing.engine_volume || 'Не указано'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Топливо:</Text>
            <Text style={styles.detailValue}>{listing.fuel_type || 'Не указано'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Местоположение:</Text>
            <Text style={styles.detailValue}>📍 {listing.region_name || listing.location}</Text>
          </View>
        </View>

        {listing.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Продавец</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerAvatar}>👤</Text>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{listing.owner_name || 'Частное лицо'}</Text>
              <Text style={styles.sellerRating}>
                ⭐ {listing.owner_rating || '5.0'} (Новый пользователь)
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬 Написать продавцу</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>📞 Позвонить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    fontSize: 28,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  heartButton: {
    fontSize: 28,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 24,
  },
  threeDButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  threeDButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  threeDViewer: {
    height: 200,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  threeDSubtext: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sellerSection: {
    marginBottom: 80,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sellerRating: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4ade80',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListingDetailScreen;
