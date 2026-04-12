import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

const FavoritesScreen = () => {
  const favorites = [
    {
      id: 1,
      title: 'BMW X5 2021',
      price: '$45,000',
      location: 'Бишкек',
      date: '10 апр 2026',
    },
    {
      id: 2,
      title: 'Mercedes-Benz E-Class',
      price: '$38,000',
      location: 'Ош',
      date: '9 апр 2026',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
        <TouchableOpacity>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {favorites.map(item => (
          <View key={item.id} style={styles.favoriteCard}>
            <View style={styles.imageContainer}>
              <Text style={styles.imagePlaceholder}>🚗</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.location}>📍 {item.location}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <TouchableOpacity style={styles.heartButton}>
              <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchIcon: {
    fontSize: 24,
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
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  heartButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 24,
  },
});

export default FavoritesScreen;
