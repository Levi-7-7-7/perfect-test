// src/screens/CertificateReviewScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewing from 'react-native-image-viewing';

type RootStackParamList = {
  CertificateReview: { certificate: any };
};

type CertificateReviewRouteProp = RouteProp<RootStackParamList, 'CertificateReview'>;

const CertificateReviewScreen = () => {
  const route = useRoute<CertificateReviewRouteProp>();
  const navigation = useNavigation();
  const { certificate } = route.params;
  const { userToken } = useAuth();

  const [points, setPoints] = useState(certificate.assignedPoints?.toString() || '');
  const [remarks, setRemarks] = useState('');
  const [visible, setVisible] = useState(false); // for image viewer

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    try {
      await axios.post( // 🔧 CHANGED FROM PUT TO POST
        `${BASE_URL}/api/tutors/certificates/${certificate._id}/review`,
        {
          status,
          updatedPoints: Number(points),
          remarks,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      Alert.alert('Success', `Certificate ${status.toLowerCase()} successfully`);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const fileUrl =
    certificate.documentUrl || certificate.certificateUrl || certificate.fileUrl;
  const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

  const openDocument = () => {
    if (fileUrl) {
      Linking.openURL(fileUrl).catch(() =>
        Alert.alert('Error', 'Could not open document')
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Student: {certificate.student?.name}</Text>
      <Text>Register No: {certificate.student?.registerNumber}</Text>
      <Text>Category: {certificate.category?.name}</Text>

      {fileUrl ? (
        isPdf ? (
          <TouchableOpacity onPress={openDocument} style={styles.preview}>
            <MaterialCommunityIcons name="file-pdf-box" size={100} color="red" />
            <Text style={styles.previewText}>Open PDF</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Image
                source={{ uri: fileUrl }}
                style={styles.image}
                resizeMode="contain"
                onError={() =>
                  Alert.alert('Image Error', 'Could not load certificate image')
                }
              />
            </TouchableOpacity>
            <ImageViewing
              images={[{ uri: fileUrl }]}
              imageIndex={0}
              visible={visible}
              onRequestClose={() => setVisible(false)}
            />
          </>
        )
      ) : (
        <Text style={{ marginVertical: 20, color: 'gray' }}>
          No certificate file provided.
        </Text>
      )}

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={points}
        onChangeText={setPoints}
        placeholder="Assign Points"
      />

      {/* ✅ Suggested Points Note */}
      <Text style={styles.suggestionText}>
        Suggested: {certificate.subcategory?.points ?? 0} points (will be auto-assigned if left unchanged)
      </Text>

      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={remarks}
        onChangeText={setRemarks}
        placeholder="Remarks (optional)"
      />

      <Button title="Approve" onPress={() => handleAction('Approved')} />
      <View style={{ height: 10 }} />
      <Button title="Reject" color="red" onPress={() => handleAction('Rejected')} />
    </View>
  );
};

export default CertificateReviewScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  preview: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fef1f1',
  },
  previewText: {
    fontSize: 16,
    color: '#d00',
    marginTop: 10,
  },
});
