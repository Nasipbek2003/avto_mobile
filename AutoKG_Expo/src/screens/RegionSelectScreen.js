import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {api} from '../config/api';

const RegionSelectScreen = ({navigation, route}) => {
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(route.params?.currentRegion || null);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = regions.filter((region) =>
        region.name_ru.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRegions(filtered);
    } else {
      setFilteredRegions(regions);
    }
  }, [searchQuery, regions]);

  const loadRegions = async () => {
    try {
      const data = await api.getRegions();
      setRegions(data);
      setFilteredRegions(data);
    } catch (error) {
      console.error('Ошибка загрузки регионов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegionIcon = (regionName) => {
    if (regionName.includes('Бишкек') || regionName.includes('Ош')) {
      return '🏙️';
    } else if (regionName.includes('Иссык-Куль')) {
      return '🏔️';
    } else if (regionName.includes('Нарын') || regionName.includes('Талас')) {
      return '⛰️';
    }
    return '🏞️';
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    if (route.params?.onSelect) {
      route.params.onSelect(region);
    }
    navigation.goBack();
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Region</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск региона..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.regionsList}>
        {filteredRegions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Регионы не найдены</Text>
          </View>
        ) : (
          filteredRegions.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionItem,
                selectedRegion?.id === region.id && styles.regionItemSelected,
              ]}
              onPress={() => handleSelectRegion(region)}>
              <View style={styles.regionIconContainer}>
                <Text style={styles.regionIcon}>
                  {getRegionIcon(region.name_ru)}
                </Text>
              </View>
              <View style={styles.regionTextContainer}>
                <Text style={styles.regionName}>{region.name_ru}</Text>
                {region.name_kg && (
                  <Text style={styles.regionNameKg}>{region.name_kg}</Text>
                )}
              </View>
              {selectedRegion?.id === region.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 28,
    color: '#7c3aed',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  regionsList: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  regionItemSelected: {
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  regionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  regionIcon: {
    fontSize: 24,
  },
  regionTextContainer: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  regionNameKg: {
    fontSize: 12,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
});

export default RegionSelectScreen;
