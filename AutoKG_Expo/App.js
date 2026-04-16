import React, { useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ToastProvider, useToast} from './src/context/ToastContext';
import {UnreadMessagesProvider} from './src/context/UnreadMessagesContext';
import CustomToast from './src/components/CustomToast';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import ChatScreen from './src/screens/ChatScreen';
import MenuScreen from './src/screens/MenuScreen';
import RegionSelectScreen from './src/screens/RegionSelectScreen';
import CategorySelectScreen from './src/screens/CategorySelectScreen';
import FuelTypeSelectScreen from './src/screens/FuelTypeSelectScreen';
import EngineVolumeSelectScreen from './src/screens/EngineVolumeSelectScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import SellerProfileScreen from './src/screens/SellerProfileScreen';
import NotificationService from './src/services/NotificationService';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {toast, hideToast} = useToast();
  const navigationRef = useRef();

  useEffect(() => {
    // Инициализация уведомлений
    const initializeNotifications = async () => {
      try {
        const token = await NotificationService.initialize();
        console.log('Push token:', token);

        // Настройка навигации для уведомлений
        NotificationService.navigateToChat = (chatId) => {
          if (navigationRef.current) {
            navigationRef.current.navigate('Chat', { chatId });
          }
        };
      } catch (error) {
        console.error('Ошибка инициализации уведомлений:', error);
      }
    };

    initializeNotifications();

    // Очистка при размонтировании
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="RegionSelect" component={RegionSelectScreen} />
          <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
          <Stack.Screen name="FuelTypeSelect" component={FuelTypeSelectScreen} />
          <Stack.Screen name="EngineVolumeSelect" component={EngineVolumeSelectScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </>
  );
};

export default function App() {
  return (
    <UnreadMessagesProvider>
      <ToastProvider>
        <AppNavigator />
      </ToastProvider>
    </UnreadMessagesProvider>
  );
}
