// src/screens/StudentDetailScreen.tsx

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';

const StudentDetailScreen = () => {
  const route = useRoute();
  const { student } = route.params;

  const categories = Object.entries(student.totalPointsByCategory || {});

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {student.name} ({student.registerNumber})
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Email: {student.email}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Activity Points by Category:
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 16 }}>
              {item[0]}: {item[1]} Points
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default StudentDetailScreen;
