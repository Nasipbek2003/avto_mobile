import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const ListingDetailScreen = ({route, navigation}) => {
  const {listing} = route.params || {
    listing: {
      title: 'Toyota Camry 2020',
      price: '$25,000',
      location: 'Бишкек',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.heartButton}>🤍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>🚗</Text>
        <TouchableOpacity style={styles.threeDButton}>
          <Text style={styles.threeDButtonText}>3D</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{listing.price}</Text>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Детали автомобиля</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Категория:</Text>
            <Text style={styles.detailValue}>Автомобиль</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Год:</Text>
            <Text style={styles.detailValue}>2020</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Пробег:</Text>
            <Text style={styles.detailValue}>50,000 км</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Местоположение:</Text>
            <Text style={styles.detailValue}>📍 {listing.location}</Text>
          </View>
        </View>

        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Продавец</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerAvatar}>👤</Text>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>Частное лицо</Text>
              <Text style={styles.sellerRating}>⭐ 4.5 (12 отзывов)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton}>
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
  },
  heartButton: {
    fontSize: 28,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 80,
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
