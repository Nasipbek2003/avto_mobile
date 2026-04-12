import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {api} from '../config/api';

const NewListingScreen = ({navigation, route}) => {
  const editMode = route.params?.editMode || false;
  const existingListing = route.params?.listing || null;

  const [title, setTitle] = useState(existingListing?.title || '');
  const [description, setDescription] = useState(existingListing?.description || '');
  const [price, setPrice] = useState(existingListing?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(existingListing?.category_id?.toString() || '');
  const [regionId, setRegionId] = useState(existingListing?.region_id?.toString() || '');
  const [brand, setBrand] = useState(existingListing?.brand || '');
  const [model, setModel] = useState(existingListing?.model || '');
  const [year, setYear] = useState(existingListing?.year?.toString() || '');
  const [mileage, setMileage] = useState(existingListing?.mileage?.toString() || '');
  const [engineVolume, setEngineVolume] = useState(existingListing?.engine_volume || '');
  const [fuelType, setFuelType] = useState(existingListing?.fuel_type || 'Бензин');
  const [photos, setPhotos] = useState([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
    requestPermissions();
    
    // Очистка состояния при открытии экрана для создания нового объявления
    if (!editMode) {
      resetForm();
    }
  }, [route.params]);

  const resetForm = () => {
    if (!editMode) {
      setTitle('');
      setDescription('');
      setPrice('');
      setBrand('');
      setModel('');
      setYear('');
      setMileage('');
      setEngineVolume('');
      setFuelType('Бензин');
      setPhotos([]);
      setUploadedPhotoUrls([]);
    }
  };

  const requestPermissions = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
    }
  };

  const loadData = async () => {
    try {
      const [categoriesData, regionsData] = await Promise.all([
        api.getCategories(),
        api.getRegions(),
      ]);
      
      setCategories(categoriesData);
      setRegions(regionsData);
      
      // Устанавливаем значения по умолчанию только если не в режиме редактирования
      if (!editMode) {
        if (categoriesData.length > 0) setCategoryId(categoriesData[0].id.toString());
        if (regionsData.length > 0) setRegionId(regionsData[0].id.toString());
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const pickImage = async () => {
    if (photos.length >= 10) {
      Alert.alert('Ограничение', 'Максимум 10 фотографий');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      if (!result.canceled) {
        const newPhotos = result.assets.slice(0, 10 - photos.length);
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Ошибка выбора фото:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить фото');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 10) {
      Alert.alert('Ограничение', 'Максимум 10 фотографий');
      return;
    }

    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к камере');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0]]);
      }
    } catch (error) {
      console.error('Ошибка съемки:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Добавить фото',
      'Выберите источник',
      [
        {
          text: 'Камера',
          onPress: takePhoto,
          icon: 'camera',
        },
        {
          text: 'Галерея',
          onPress: pickImage,
          icon: 'images',
        },
        {text: 'Отмена', style: 'cancel'},
      ],
      {cancelable: true}
    );
  };

  const handlePublish = async () => {
    // Валидация
    if (!brand || !price || !categoryId || !regionId || !year) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      // Загрузка фото на сервер
      let photoUrls = [...uploadedPhotoUrls];
      if (photos.length > 0) {
        setUploading(true);
        try {
          const uploadResult = await api.uploadPhotos(photos.map(p => p.uri));
          photoUrls = [...photoUrls, ...uploadResult.urls];
        } catch (error) {
          console.error('Ошибка загрузки фото:', error);
          Alert.alert('Предупреждение', 'Не удалось загрузить фото, но объявление будет создано');
        } finally {
          setUploading(false);
        }
      }

      const listingData = {
        title: `${brand} ${model} ${year}`,
        description,
        price: parseFloat(price),
        category_id: parseInt(categoryId),
        region_id: parseInt(regionId),
        brand,
        model,
        year: parseInt(year),
        mileage: mileage ? parseInt(mileage) : null,
        engine_volume: engineVolume,
        fuel_type: fuelType,
        photos: photoUrls,
      };

      if (editMode && existingListing) {
        await api.updateListing(existingListing.id, listingData);
        Alert.alert('Успешно', 'Объявление обновлено!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        await api.createListing(listingData);
        Alert.alert('Успешно', 'Объявление опубликовано!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error) {
      console.error('Ошибка публикации:', error);
      Alert.alert('Ошибка', 'Не удалось опубликовать объявление');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7c3aed" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editMode ? 'Редактировать объявление' : 'Новое объявление'}
        </Text>
        <View style={{width: 80}} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Категория *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() =>
            navigation.navigate('CategorySelect', {
              currentCategory: categories.find(c => c.id.toString() === categoryId),
              onSelect: (category) => setCategoryId(category.id.toString()),
            })
          }>
          <Text style={styles.selectButtonText}>
            {categories.find(c => c.id.toString() === categoryId)?.name_ru || 'Выберите категорию'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Регион *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() =>
            navigation.navigate('RegionSelect', {
              currentRegion: regions.find(r => r.id.toString() === regionId),
              onSelect: (region) => setRegionId(region.id.toString()),
            })
          }>
          <Text style={styles.selectButtonText}>
            {regions.find(r => r.id.toString() === regionId)?.name_ru || 'Выберите регион'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Марка *</Text>
        <TextInput
          style={styles.input}
          placeholder="Toyota"
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={styles.label}>Модель</Text>
        <TextInput
          style={styles.input}
          placeholder="Camry"
          value={model}
          onChangeText={setModel}
        />

        <Text style={styles.label}>Год выпуска *</Text>
        <TextInput
          style={styles.input}
          placeholder="2020"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Пробег (км)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Объём двигателя</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() =>
            navigation.navigate('EngineVolumeSelect', {
              currentVolume: engineVolume,
              onSelect: (volume) => setEngineVolume(volume),
            })
          }>
          <Text style={styles.selectButtonText}>
            {engineVolume || 'Выберите объем двигателя'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Тип топлива *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() =>
            navigation.navigate('FuelTypeSelect', {
              currentFuelType: fuelType,
              onSelect: (fuel) => setFuelType(fuel),
            })
          }>
          <Text style={styles.selectButtonText}>
            {fuelType || 'Выберите тип топлива'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Цена ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="25000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Опишите состояние автомобиля, комплектацию..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Фотографии ({photos.length}/10)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions}>
            <Ionicons name="camera" size={32} color="#7c3aed" />
            <Text style={styles.addPhotoText}>Добавить</Text>
          </TouchableOpacity>
          
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{uri: photo.uri}} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.publishButton} 
            onPress={handlePublish}
            disabled={loading || uploading}>
            {loading || uploading ? (
              <>
                <ActivityIndicator color="#fff" />
                {uploading && <Text style={styles.uploadingText}>Загрузка фото...</Text>}
              </>
            ) : (
              <Text style={styles.publishButtonText}>
                {editMode ? 'Сохранить' : 'Опубликовать'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
  photosScroll: {
    marginBottom: 16,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 8,
    fontWeight: '500',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  photoButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  uploadingText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
});

export default NewListingScreen;
