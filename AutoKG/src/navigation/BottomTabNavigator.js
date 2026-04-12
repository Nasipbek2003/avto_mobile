import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewListingScreen from '../screens/NewListingScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({color}) => <span style={{fontSize: 24}}>🏠</span>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Избранное',
          tabBarIcon: ({color}) => <span style={{fontSize: 24}}>❤️</span>,
        }}
      />
      <Tab.Screen
        name="NewListing"
        component={NewListingScreen}
        options={{
          tabBarLabel: 'Добавить',
          tabBarIcon: ({color}) => <span style={{fontSize: 32}}>➕</span>,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Чаты',
          tabBarIcon: ({color}) => <span style={{fontSize: 24}}>💬</span>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({color}) => <span style={{fontSize: 24}}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
