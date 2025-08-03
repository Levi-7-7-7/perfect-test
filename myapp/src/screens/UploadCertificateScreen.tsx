// src/screens/UploadCertificateScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { PermissionsAndroid, Platform } from 'react-native';

const requestStoragePermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your files to upload certificates',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};


const UploadCertificateScreen = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<any>(null);

    const pickDocument = async () => {
  const permissionGranted = await requestStoragePermission();
  if (!permissionGranted) {
    Alert.alert('Permission denied', 'Storage permission is required');
    return;
  }

  try {
    const [res] = await pick({
      type: [types.pdf, types.images, types.plainText, types.doc, types.docx, types.allFiles],
    });
    setFile(res);
  } catch (err: any) {
    if (err?.message?.includes('cancelled')) {
      console.log('User cancelled picker');
    } else {
      console.error('DocumentPicker Error:', err);
      Alert.alert('Error picking file');
    }
  }
};

  const handleUpload = async () => {
    if (!title || !category || !file) {
      Alert.alert('All fields are required');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();

    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', {
      uri: file.fileCopyUri || file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);

    try {
      const res = await axios.post(`${BASE_URL}/api/students/certificates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Success', 'Certificate uploaded!');
      setTitle('');
      setCategory('');
      setFile(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Upload failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload Certificate</Text>
      <TextInput
        style={styles.input}
        placeholder="Title of Activity"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
        <Text style={styles.fileButtonText}>{file ? file.name : 'Choose File'}</Text>
      </TouchableOpacity>
      <Button title="Upload" onPress={handleUpload} />
    </View>
  );
};

export default UploadCertificateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  fileButton: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  fileButtonText: {
    color: '#333',
  },
});
