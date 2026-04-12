import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const Car3DViewer = ({carModel = '🚗'}) => {
  const [rotation, setRotation] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newRotation = rotation + gestureState.dx / 2;
        setRotation(newRotation);
      },
      onPanResponderRelease: () => {
        // Можно добавить инерцию
      },
    })
  ).current;

  const getCarView = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    if (normalizedRotation < 45 || normalizedRotation >= 315) {
      return {emoji: '🚗', label: 'Вид спереди'};
    } else if (normalizedRotation >= 45 && normalizedRotation < 135) {
      return {emoji: '🚙', label: 'Вид сбоку (правый)'};
    } else if (normalizedRotation >= 135 && normalizedRotation < 225) {
      return {emoji: '🚕', label: 'Вид сзади'};
    } else {
      return {emoji: '🚐', label: 'Вид сбоку (левый)'};
    }
  };

  const currentView = getCarView();

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.viewer}>
        <Text style={styles.carEmoji}>{currentView.emoji}</Text>
        <View style={styles.rotationIndicator}>
          <View
            style={[
              styles.rotationBar,
              {transform: [{rotate: `${rotation}deg`}]},
            ]}
          />
        </View>
      </View>
      
      <View style={styles.controls}>
        <Text style={styles.viewLabel}>{currentView.label}</Text>
        <Text style={styles.hint}>👆 Проведите пальцем для поворота</Text>
      </View>

      <View style={styles.angleIndicator}>
        <Text style={styles.angleText}>{Math.round(rotation % 360)}°</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewer: {
    width: width * 0.8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carEmoji: {
    fontSize: 120,
  },
  rotationIndicator: {
    position: 'absolute',
    bottom: 20,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotationBar: {
    width: 2,
    height: 40,
    backgroundColor: '#7c3aed',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  viewLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  angleIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  angleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Car3DViewer;
