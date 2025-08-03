import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import TutorTabs from './TutorTabs';
import StudentTabs from './StudentTabs'; // ✅ Added

// Auth and common Screens
import LoginScreen from '../screens/LoginScreen';
import SendOtpScreen from '../screens/SendOtpScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import AuthLandingScreen from '../screens/AuthLandingScreen';

// Tutor-only Screens
import CertificateReviewScreen from '../screens/CertificateReviewScreen';
import TutorStudentsScreen from '../screens/TutorStudentsScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, userInfo, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          userInfo?.role === 'tutor' ? (
            <>
              {/* Tutor tabs and extra screens */}
              <Stack.Screen name="TutorTabs" component={TutorTabs} />
              <Stack.Screen name="CertificateReview" component={CertificateReviewScreen} />
              <Stack.Screen name="TutorStudents" component={TutorStudentsScreen} />
              <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
            </>
          ) : (
            <>
              {/* Student tab layout */}
              <Stack.Screen name="StudentTabs" component={StudentTabs} />
            </>
          )
        ) : (
          <>
            {/* Unauthenticated screens */}
            <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SendOtp" component={SendOtpScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
