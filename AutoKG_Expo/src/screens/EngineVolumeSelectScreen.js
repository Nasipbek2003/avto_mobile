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

const EngineVolumeSelectScreen = ({navigation, route}) => {
  const [selectedVolume, setSelectedVolume] = useState(route.params?.currentVolume || null);

  const engineVolumes = [
    {id: '1.0L', name: '1.0L', range: 'до 1.0 литра'},
    {id: '1.2L', name: '1.2L', range: '1.0 - 1.4 литра'},
    {id: '1.4L', name: '1.4L', range: '1.4 - 1.6 литра'},
    {id: '1.6L', name: '1.6L', range: '1.6 - 1.8 литра'},
    {id: '1.8L', name: '1.8L', range: '1.8 - 2.0 литра'},
    {id: '2.0L', name: '2.0L', range: '2.0 - 2.2 литра'},
    {id: '2.2L', name: '2.2L', range: '2.2 - 2.5 литра'},
    {id: '2.5L', name: '2.5L', range: '2.5 - 3.0 литра'},
    {id: '3.0L', name: '3.0L', range: '3.0 - 3.5 литра'},
    {id: '3.5L', name: '3.5L', range: '3.5 - 4.0 литра'},
    {id: '4.0L', name: '4.0L', range: '4.0 - 5.0 литра'},
    {id: '5.0L+', name: '5.0L+', range: 'более 5.0 литра'},
  ];

  const handleSelectVolume = (volume) => {
    setSelectedVolume(volume.id);
    if (route.params?.onSelect) {
      route.params.onSelect(volume.id);
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
        <Text style={styles.headerTitle}>Объем двигателя</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Ionicons name="speedometer" size={48} color="#7c3aed" />
          <Text style={styles.infoText}>Выберите объем двигателя</Text>
        </View>

        <View style={styles.optionsList}>
          {engineVolumes.map((volume) => (
            <TouchableOpacity
              key={volume.id}
              style={[
                styles.optionItem,
                selectedVolume === volume.id && styles.optionItemSelected,
              ]}
              onPress={() => handleSelectVolume(volume)}
              activeOpacity={0.7}>
              <View style={styles.optionIconContainer}>
                <Ionicons 
                  name="speedometer-outline" 
                  size={26} 
                  color="#7c3aed" 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionName}>{volume.name}</Text>
                <Text style={styles.optionRange}>{volume.range}</Text>
              </View>
              {selectedVolume === volume.id && (
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
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionRange: {
    fontSize: 13,
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
});

export default EngineVolumeSelectScreen;
