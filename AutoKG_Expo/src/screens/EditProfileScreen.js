import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';
import {api, getImageUrl} from '../config/api';

const EditProfileScreen = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await api.getProfile();
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      });
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Запрашиваем разрешение
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      // Используем правильный метод из expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        try {
          const uploadResult = await api.uploadPhoto(result.assets[0].uri);
          setFormData({...formData, avatar_url: uploadResult.url});
          Alert.alert('Успешно', 'Фото загружено');
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить фото');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Ошибка выбора фото:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к камере');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        try {
          const uploadResult = await api.uploadPhoto(result.assets[0].uri);
          setFormData({...formData, avatar_url: uploadResult.url});
          Alert.alert('Успешно', 'Фото загружено');
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить фото');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Ошибка съемки фото:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Выберите действие',
      'Откуда загрузить фото?',
      [
        {
          text: 'Камера',
          onPress: takePhoto,
        },
        {
          text: 'Галерея',
          onPress: pickImage,
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    // Валидация телефона (опционально)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        Alert.alert('Ошибка', 'Введите корректный номер телефона');
        return;
      }
    }

    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(formData);
      
      // Обновляем данные пользователя в AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUserData = {
          ...user,
          name: formData.name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      }
      
      Alert.alert('Успешно', 'Профиль обновлен', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={showPhotoOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#7c3aed" />
            ) : formData.avatar_url ? (
              <Image 
                source={{uri: getImageUrl(formData.avatar_url)}} 
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-outline" size={60} color="#999" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={showPhotoOptions}
            disabled={uploading}
          >
            <Ionicons name="camera" size={18} color="#7c3aed" />
            <Text style={styles.changePhotoText}>
              {uploading ? 'Загрузка...' : formData.avatar_url ? 'Изменить фото' : 'Добавить фото'}
            </Text>
          </TouchableOpacity>
          {formData.avatar_url && (
            <TouchableOpacity 
              style={styles.removePhotoButton}
              onPress={() => setFormData({...formData, avatar_url: ''})}
            >
              <Text style={styles.removePhotoText}>Удалить фото</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите ваше имя"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              placeholder="+996 XXX XXX XXX"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
              maxLength={20}
            />
            <Text style={styles.helperText}>
              Ваш номер телефона будет виден покупателям
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#7c3aed" />
            <Text style={styles.infoText}>
              Email нельзя изменить. Для смены email обратитесь в поддержку.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePhotoText: {
    color: '#7c3aed',
    fontSize: 15,
    fontWeight: '600',
  },
  removePhotoButton: {
    marginTop: 8,
  },
  removePhotoText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f0ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditProfileScreen;
