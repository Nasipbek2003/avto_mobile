import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = ({navigation}) => {
  const [currentLanguage, setCurrentLanguage] = useState('RU');

  const menuItems = [
    {
      id: 'login',
      icon: 'person-circle-outline',
      title: 'Login / Register',
      subtitle: 'Войти или создать аккаунт',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: 'language',
      icon: 'language-outline',
      title: 'Language',
      subtitle: `Текущий: ${currentLanguage}`,
      onPress: () => navigation.navigate('LanguageSelect'),
    },
    {
      id: 'search',
      icon: 'search-outline',
      title: 'Search Ads',
      subtitle: 'Поиск объявлений',
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: 'new',
      icon: 'add-circle-outline',
      title: 'New Ads',
      subtitle: 'Создать объявление',
      onPress: async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Требуется авторизация', 'Войдите для создания объявления');
          navigation.navigate('Login');
        } else {
          navigation.navigate('Main', {screen: 'NewListing'});
        }
      },
    },
    {
      id: 'myads',
      icon: 'folder-open-outline',
      title: 'My Ads',
      subtitle: 'Мои объявления',
      onPress: async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Требуется авторизация', 'Войдите для просмотра объявлений');
          navigation.navigate('Login');
        } else {
          navigation.navigate('Main', {screen: 'Profile'});
        }
      },
    },
    {
      id: 'contacts',
      icon: 'mail-outline',
      title: 'Developer Contacts',
      subtitle: 'Связаться с разработчиком',
      onPress: () => {
        Alert.alert(
          'Контакты разработчика',
          'Email: dev@autokg.kg\nTelegram: @autokg_dev\nPhone: +996 XXX XXX XXX',
          [{text: 'OK'}]
        );
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="car-sport" size={60} color="#7c3aed" />
          </View>
          <Text style={styles.appName}>Auto.KG</Text>
          <Text style={styles.appTagline}>Маркетплейс автомобилей</Text>
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={26} color="#7c3aed" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.0.0</Text>
          <Text style={styles.footerText}>© 2026 Auto.KG</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#7c3aed',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  menuList: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
});

export default MenuScreen;
