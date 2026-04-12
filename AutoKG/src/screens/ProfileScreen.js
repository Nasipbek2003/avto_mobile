import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

const ProfileScreen = ({navigation}) => {
  const myAds = [
    {
      id: 1,
      title: 'Toyota Camry 2020',
      price: '$25,000',
      status: 'Активно',
      date: '5 апр 2026',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>
        <Text style={styles.userName}>Иван Иванов</Text>
        <Text style={styles.userEmail}>ivan@example.com</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Редактировать профиль</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мои объявления</Text>
        {myAds.map(ad => (
          <View key={ad.id} style={styles.adCard}>
            <View style={styles.adImage}>
              <Text style={styles.imagePlaceholder}>🚗</Text>
            </View>
            <View style={styles.adInfo}>
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.adPrice}>{ad.price}</Text>
              <View style={styles.adMeta}>
                <Text style={styles.adStatus}>{ad.status}</Text>
                <Text style={styles.adDate}>{ad.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Настройки</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🌐</Text>
          <Text style={styles.menuText}>Язык</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.menuText}>Выйти</Text>
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 32,
  },
  adInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
  },
  adStatus: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
  },
  adDate: {
    fontSize: 12,
    color: '#999',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
  },
});

export default ProfileScreen;
