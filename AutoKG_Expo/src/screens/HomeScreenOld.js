import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {api} from '../config/api';

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

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryIconContainer}>
                <Ionicons 
                  name={
                    cat.name_ru === 'Автомобили' ? 'car-sport' : 
                    cat.name_ru === 'Мотоциклы' ? 'bicycle' :
                    cat.name_ru === 'Грузовики' ? 'bus' : 'construct'
                  } 
                  size={32} 
                  color="#7c3aed" 
                />
              </View>
              <Text style={styles.categoryName}>{cat.name_ru}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Последние объявления</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Пока нет объявлений</Text>
          <Text style={styles.emptySubtext}>Будьте первым!</Text>
        </View>
      ) : (
        listings.map(listing => (
          <TouchableOpacity
            key={listing.id}
            style={styles.adCard}
            onPress={() => navigation.navigate('ListingDetail', {listing})}>
            <View style={styles.adImage}>
              <Ionicons name="car-sport" size={48} color="#999" />
            </View>
            <View style={styles.adInfo}>
              <Text style={styles.adTitle}>{listing.title}</Text>
              <Text style={styles.adPrice}>${listing.price?.toLocaleString()}</Text>
              <View style={styles.adLocationRow}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.adLocation}>
                  {listing.region_name || 'Не указан'} • {formatTimeAgo(listing.created_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
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
  },
});

export default HomeScreen;
