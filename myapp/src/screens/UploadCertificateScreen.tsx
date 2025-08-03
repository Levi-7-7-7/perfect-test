import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/constants';

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
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategoryObj, setSelectedSubCategoryObj] = useState<any>(null);
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        Alert.alert('Error', 'Could not load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryObj(null);

    const selected = categories.find((cat) => cat._id === categoryId);
    if (selected && selected.subCategories) {
      setSubCategories(selected.subCategories);
    } else {
      setSubCategories([]);
    }
  };

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
    if (!selectedCategoryId || !selectedSubCategoryObj || !file) {
      Alert.alert('All fields are required');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();

    formData.append('categoryId', selectedCategoryId);
    formData.append('subcategoryName', selectedSubCategoryObj.name);
    formData.append('level', selectedSubCategoryObj.level || '');
    formData.append('file', {
      uri: file.fileCopyUri || file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);

    try {
      await axios.post(`${BASE_URL}/api/certificates/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Success', 'Certificate uploaded!');
      setSelectedCategoryId('');
      setSelectedSubCategoryObj(null);
      setFile(null);
    } catch (err: any) {
      console.error('Upload Error:', err.response?.data || err.message || err);
      Alert.alert(
        'Upload Failed',
        err.response?.data?.message || err.message || 'Something went wrong'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload Certificate</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategoryId}
          onValueChange={handleCategoryChange}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
          ))}
        </Picker>
      </View>

      {subCategories.length > 0 && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubCategoryObj?.name || ''}
            onValueChange={(value) => {
              const selected = subCategories.find((s) => s.name === value);
              setSelectedSubCategoryObj(selected);
            }}
          >
            <Picker.Item label="Select Subcategory" value="" />
            {subCategories.map((sub, index) => (
              <Picker.Item
                key={index}
                label={`${sub.name}${sub.level ? ` (${sub.level})` : ''}`}
                value={sub.name}
              />
            ))}
          </Picker>
        </View>
      )}

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
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
