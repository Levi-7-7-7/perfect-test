// src/screens/TutorStudentsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  totalPoints: number;
}

const TutorStudentsScreen = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const navigation = useNavigation();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/tutors/students`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setStudents(response.data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    fetchStudents();
  }, []);

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StudentDetailScreen' as never, { studentId: item._id } as never)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>Reg No: {item.registerNumber}</Text>
      <Text style={styles.details}>Total Points: {item.totalPoints}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default TutorStudentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
});
