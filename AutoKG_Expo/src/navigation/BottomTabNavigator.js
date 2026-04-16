import React from 'react';
import {Platform, View, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {useUnreadMessages} from '../context/UnreadMessagesContext';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewListingScreen from '../screens/NewListingScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { unreadCount } = useUnreadMessages();

  // Компонент для отображения badge с количеством непрочитанных
  const ChatTabIcon = ({ color, focused }) => (
    <View style={{ position: 'relative' }}>
      <Ionicons 
        name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
        size={26} 
        color={color} 
      />
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute',
          right: -8,
          top: -8,
          backgroundColor: '#ef4444',
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#fff',
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Избранное',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="NewListing"
        component={NewListingScreen}
        options={{
          tabBarLabel: 'Добавить',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={32} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Чаты',
          tabBarIcon: ChatTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
