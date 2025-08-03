// src/navigation/TutorStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TutorStudentsScreen from '../screens/TutorStudentsScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';

export type TutorStackParamList = {
  TutorStudents: undefined;
  StudentDetail: { student: any };
};

const Stack = createNativeStackNavigator<TutorStackParamList>();

const TutorStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TutorStudents" component={TutorStudentsScreen} options={{ title: 'All Students' }} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} options={{ title: 'Student Details' }} />
    </Stack.Navigator>
  );
};

export default TutorStackNavigator;
