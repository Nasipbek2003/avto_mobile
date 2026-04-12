import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const HomeScreen = ({navigation}) => {
  const categories = [
    {id: 1, name: 'Автомобили', icon: '🚗'},
    {id: 2, name: 'Мотоциклы', icon: '🏍️'},
    {id: 3, name: 'Грузовики', icon: '🚚'},
    {id: 4, name: 'Запчасти', icon: '🔧'},
  ];

  const latestAds = [
    {
      id: 1,
      title: 'Toyota Camry 2020',
      price: '$25,000',
      location: 'Бишкек',
      time: '2 часа назад',
    },
    {
      id: 2,
      title: 'Honda Accord 2019',
      price: '$22,000',
      location: 'Ош',
      time: '5 часов назад',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.cityText}>Бишкек ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
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

      {latestAds.map(ad => (
        <TouchableOpacity
          key={ad.id}
          style={styles.adCard}
          onPress={() => navigation.navigate('ListingDetail', {listing: ad})}>
          <View style={styles.adImage}>
            <Text style={styles.imagePlaceholder}>🚗</Text>
          </View>
          <View style={styles.adInfo}>
            <Text style={styles.adTitle}>{ad.title}</Text>
            <Text style={styles.adPrice}>{ad.price}</Text>
            <Text style={styles.adLocation}>
              📍 {ad.location} • {ad.time}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  menuIcon: {
    fontSize: 24,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchIcon: {
    fontSize: 24,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  adImage: {
    width: 120,
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  adInfo: {
    flex: 1,
    padding: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  adLocation: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;
