import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSelectScreen = ({navigation}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('RU');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('language');
      if (lang) {
        setSelectedLanguage(lang);
      }
    } catch (error) {
      console.error('Ошибка загрузки языка:', error);
    }
  };

  const languages = [
    {
      code: 'RU',
      name: 'Русский',
      nativeName: 'Русский',
      flag: '🇷🇺',
    },
    {
      code: 'EN',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'KG',
      name: 'Кыргызский',
      nativeName: 'Кыргызча',
      flag: '🇰🇬',
    },
  ];

  const handleSelectLanguage = async (langCode) => {
    try {
      await AsyncStorage.setItem('language', langCode);
      setSelectedLanguage(langCode);
      
      Alert.alert(
        'Язык изменен',
        'Язык интерфейса будет изменен при следующем запуске приложения',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Ошибка сохранения языка:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить язык');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language / Язык</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>🌐</Text>
          <Text style={styles.infoTitle}>Выберите язык интерфейса</Text>
          <Text style={styles.infoSubtitle}>
            Choose your preferred language
          </Text>
        </View>

        <View style={styles.languagesList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage === lang.code && styles.languageItemSelected,
              ]}
              onPress={() => handleSelectLanguage(lang.code)}>
              <View style={styles.languageIconContainer}>
                <Text style={styles.languageFlag}>{lang.flag}</Text>
              </View>
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.languageNativeName}>{lang.nativeName}</Text>
              </View>
              {selectedLanguage === lang.code && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            Изменение языка вступит в силу при следующем запуске приложения
          </Text>
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
  content: {
    flex: 1,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  infoIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  languagesList: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  languageIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#666',
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

export default LanguageSelectScreen;
