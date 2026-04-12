import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const FuelTypeSelectScreen = ({navigation, route}) => {
  const [selectedFuelType, setSelectedFuelType] = useState(route.params?.currentFuelType || null);

  const fuelTypes = [
    {id: 'Бензин', name: 'Бензин', icon: 'water', color: '#3b82f6'},
    {id: 'Дизель', name: 'Дизель', icon: 'water-outline', color: '#8b5cf6'},
    {id: 'Газ', name: 'Газ', icon: 'flame', color: '#f59e0b'},
    {id: 'Электро', name: 'Электро', icon: 'flash', color: '#10b981'},
    {id: 'Гибрид', name: 'Гибрид', icon: 'leaf', color: '#06b6d4'},
  ];

  const handleSelectFuelType = (fuelType) => {
    setSelectedFuelType(fuelType.id);
    if (route.params?.onSelect) {
      route.params.onSelect(fuelType.id);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тип топлива</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={48} color="#7c3aed" />
          <Text style={styles.infoText}>Выберите тип топлива автомобиля</Text>
        </View>

        <View style={styles.optionsList}>
          {fuelTypes.map((fuelType) => (
            <TouchableOpacity
              key={fuelType.id}
              style={[
                styles.optionItem,
                selectedFuelType === fuelType.id && styles.optionItemSelected,
              ]}
              onPress={() => handleSelectFuelType(fuelType)}
              activeOpacity={0.7}>
              <View style={[styles.optionIconContainer, {backgroundColor: `${fuelType.color}15`}]}>
                <Ionicons 
                  name={fuelType.icon} 
                  size={28} 
                  color={fuelType.color} 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionName}>{fuelType.name}</Text>
              </View>
              {selectedFuelType === fuelType.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  infoContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  optionsList: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FuelTypeSelectScreen;
