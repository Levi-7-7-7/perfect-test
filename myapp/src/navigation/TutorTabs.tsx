// src/navigation/TutorTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TutorHomeScreen from '../screens/TutorHomeScreen';
import TutorPendingScreen from '../screens/TutorPendingScreen';
import TutorStudentsScreen from '../screens/TutorStudentsScreen'; // ✅ YOUR screen
import ProfileScreen from '../screens/ProfileScreen';

import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const TutorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Dashboard') {
            iconName = 'home-outline';
          } else if (route.name === 'Pending') {
            iconName = 'document-text-outline';
          } else if (route.name === 'Students') {
            iconName = 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerShown: true,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={TutorHomeScreen} />
      <Tab.Screen name="Pending" component={TutorPendingScreen} />
      <Tab.Screen name="Students" component={TutorStudentsScreen} /> {/* ✅ CORRECTED */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TutorTabs;
