import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {api} from '../config/api';

const SearchScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, regionsData] = await Promise.all([
        api.getCategories(),
        api.getRegions(),
      ]);
      setCategories(categoriesData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedRegion) params.region = selectedRegion;
      
      const data = await api.getListings(params);
      
      // Фильтрация по цене и году на клиенте
      let filtered = data;
      
      if (minPrice) {
        filtered = filtered.filter(item => item.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(item => item.price <= parseFloat(maxPrice));
      }
      if (minYear) {
        filtered = filtered.filter(item => item.year >= parseInt(minYear));
      }
      if (maxYear) {
        filtered = filtered.filter(item => item.year <= parseInt(maxYear));
      }
      if (fuelType) {
        filtered = filtered.filter(item => item.fuel_type === fuelType);
      }
      
      setResults(filtered);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRegion('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setFuelType('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск автомобилей..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Фильтры</Text>
          
          <Text style={styles.label}>Категория</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() =>
              navigation.navigate('CategorySelect', {
                currentCategory: categories.find(c => c.id.toString() === selectedCategory),
                onSelect: (category) => setSelectedCategory(category.id.toString()),
              })
            }>
            <Text style={styles.selectButtonText}>
              {categories.find(c => c.id.toString() === selectedCategory)?.name_ru || 'Все категории'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <Text style={styles.label}>Регион</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() =>
              navigation.navigate('RegionSelect', {
                currentRegion: regions.find(r => r.id.toString() === selectedRegion),
                onSelect: (region) => setSelectedRegion(region.id.toString()),
              })
            }>
            <Text style={styles.selectButtonText}>
              {regions.find(r => r.id.toString() === selectedRegion)?.name_ru || 'Все регионы'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <Text style={styles.label}>Цена ($)</Text>
          <View style={styles.rangeContainer}>
            <TextInput
              style={styles.rangeInput}
              placeholder="От"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />
            <Text style={styles.rangeSeparator}>—</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="До"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Год выпуска</Text>
          <View style={styles.rangeContainer}>
            <TextInput
              style={styles.rangeInput}
              placeholder="От"
              value={minYear}
              onChangeText={setMinYear}
              keyboardType="numeric"
            />
            <Text style={styles.rangeSeparator}>—</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="До"
              value={maxYear}
              onChangeText={setMaxYear}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Тип топлива</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() =>
              navigation.navigate('FuelTypeSelect', {
                currentFuelType: fuelType,
                onSelect: (fuel) => setFuelType(fuel),
              })
            }>
            <Text style={styles.selectButtonText}>
              {fuelType || 'Любой'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory || selectedRegion 
                ? 'Ничего не найдено' 
                : 'Введите запрос для поиска'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>Найдено: {results.length}</Text>
            {results.map(listing => (
              <TouchableOpacity
                key={listing.id}
                style={styles.resultCard}
                onPress={() => navigation.navigate('ListingDetail', {listing})}>
                <View style={styles.resultImage}>
                  {listing.photos && listing.photos.length > 0 ? (
                    <Image
                      source={{
                        uri: (() => {
                          const photos = typeof listing.photos === 'string' 
                            ? JSON.parse(listing.photos) 
                            : listing.photos;
                          const photoPath = photos[0];
                          return photoPath.startsWith('http') 
                            ? photoPath 
                            : `http://172.20.10.2:3000${photoPath}`;
                        })()
                      }}
                      style={styles.resultImageFull}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <Ionicons name="car-sport" size={48} color="#999" />
                  )}
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{listing.title}</Text>
                  <Text style={styles.resultPrice}>${listing.price?.toLocaleString()}</Text>
                  <Text style={styles.resultDetails}>
                    {listing.year} • {listing.mileage?.toLocaleString()} км
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.resultLocation}>{listing.region_name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    maxHeight: 400,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fff',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#666',
  },
  filterButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  resultsCount: {
    padding: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultImage: {
    width: 120,
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultImageFull: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultLocation: {
    fontSize: 12,
    color: '#666',
  },
});

export default SearchScreen;
