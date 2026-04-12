import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {debounce} from 'lodash';
import {api, getImageUrl} from '../config/api';

// Мемоизированный компонент карточки объявления
const ListingCard = React.memo(({item, onPress}) => {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  const getImageUrl = () => {
    if (item.photos && item.photos.length > 0) {
      // Если photos это строка JSON, парсим её
      const photos = typeof item.photos === 'string' ? JSON.parse(item.photos) : item.photos;
      const photoPath = photos[0];
      // Cloudinary URL уже полный, просто возвращаем
      return photoPath;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <TouchableOpacity
      style={styles.adCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.adImage}>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            style={styles.adImageFull}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name="car-sport" size={48} color="#999" />
        )}
      </View>
      <View style={styles.adInfo}>
        <Text style={styles.adTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.adPrice}>${item.price?.toLocaleString()}</Text>
        <View style={styles.adLocationRow}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.adLocation} numberOfLines={1}>
            {item.region_name || 'Не указан'} • {formatTimeAgo(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Мемоизированный компонент категории
const CategoryCard = React.memo(({category, onPress}) => {
  const getIconName = (name) => {
    if (name === 'Автомобили') return 'car-sport';
    if (name === 'Мотоциклы') return 'bicycle';
    if (name === 'Грузовики') return 'bus';
    return 'construct';
  };

  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryIconContainer}>
        <Ionicons 
          name={getIconName(category.name_ru)} 
          size={32} 
          color="#7c3aed" 
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name_ru}
      </Text>
    </TouchableOpacity>
  );
});

const HomeScreen = ({navigation}) => {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Бишкек');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, listingsData] = await Promise.all([
        api.getCategories(),
        api.getListings(),
      ]);
      
      setCategories(categoriesData);
      setListings(listingsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleListingPress = useCallback((listing) => {
    navigation.navigate('ListingDetail', {listing});
  }, [navigation]);

  const handleCategoryPress = useCallback((category) => {
    navigation.navigate('Search', {categoryId: category.id});
  }, [navigation]);

  const renderListingItem = useCallback(({item}) => (
    <ListingCard 
      item={item} 
      onPress={() => handleListingPress(item)} 
    />
  ), [handleListingPress]);

  const renderCategoryItem = useCallback(({item}) => (
    <CategoryCard 
      category={item} 
      onPress={() => handleCategoryPress(item)} 
    />
  ), [handleCategoryPress]);

  const ListHeader = useMemo(() => (
    <>
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Последние объявления</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>
    </>
  ), [categories, renderCategoryItem]);

  const ListEmpty = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#ddd" />
      <Text style={styles.emptyText}>Пока нет объявлений</Text>
      <Text style={styles.emptySubtext}>Будьте первым!</Text>
    </View>
  ), []);

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
          onPress={() => navigation.navigate('Menu')}
          style={styles.headerButton}
        >
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('RegionSelect', {
            currentRegion: selectedRegion,
            onSelect: (region) => setSelectedRegion(region.name_ru)
          })}
          style={styles.cityButton}
        >
          <Text style={styles.cityText}>{selectedRegion}</Text>
          <Ionicons name="chevron-down" size={18} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Search')}
          style={styles.headerButton}
        >
          <Ionicons name="search" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
      />
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
  },
  headerButton: {
    padding: 4,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  categoryIconContainer: {
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#7c3aed',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adImage: {
    width: 120,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  adImageFull: {
    width: '100%',
    height: '100%',
  },
  adInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  adPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  adLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adLocation: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default HomeScreen;
