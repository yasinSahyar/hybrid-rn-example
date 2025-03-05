import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Input } from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Alert, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationType } from '../types/LocalTypes';
import { useFile, useMedia } from '../hooks/apiHooks';
import { useUserContext } from '../hooks/ContextHooks';

type UploadInputs = {
  title: string;
  description: string;
};

const Upload = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<NavigationType>>();
  const { user } = useUserContext();
  const { postExpoFile, loading } = useFile();
  const { postMedia } = useMedia();

  const initValues: UploadInputs = { title: '', description: '' };
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UploadInputs>({
    defaultValues: initValues,
    mode: 'onChange',
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          Platform.OS === 'web'
            ? undefined
            : ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.6,
      });

      console.log('ImagePicker result:', result);

      if (!result.canceled) {
        setImage(result);
      }
    } catch (error) {
      console.error('Image picking failed:', error);
      Alert.alert('Error', 'Failed to pick an image');
    }
  };

  const doUpload = async (inputs: UploadInputs) => {
    if (!image) {
      Alert.alert('Error', 'Media not selected');
      return;
    }

    if (!user || !user.token) {
      Alert.alert('Error', 'User not logged in or token missing');
      console.log('User object:', user);
      return;
    }

    try {
      console.log('Using token:', user.token);

      console.log('Uploading file:', image.assets[0].uri);
      const fileResult = await postExpoFile(image.assets[0].uri, user.token);
      console.log('postExpoFile result:', fileResult);

      if (!fileResult || !fileResult.data || !fileResult.data.filename) {
        throw new Error(
          fileResult?.message || 'File upload failed or invalid response from server'
        );
      }

      console.log('Posting media with inputs:', inputs, 'fileResult:', fileResult);
      const mediaResult = await postMedia(fileResult, inputs, user.token);
      console.log('postMedia result:', mediaResult);

      if (!mediaResult || !mediaResult.message) {
        throw new Error('Media registration failed');
      }

      reset();
      setImage(null);

      Alert.alert('Success', 'File uploaded successfully!');
      navigation.navigate('All Media');
    } catch (error) {
      console.error('doUpload failed:', error);
      Alert.alert(
        'Upload Error',
        (error as Error).message || 'An unexpected error occurred'
      );
    }
  };

  return (
    <Card>
      <Controller
        control={control}
        rules={{
          required: { value: true, message: 'Title is required' },
          minLength: { value: 3, message: 'Minimum length is 3 characters' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Title"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            errorMessage={errors.title?.message}
          />
        )}
        name="title"
      />

      <Controller
        control={control}
        rules={{
          required: { value: true, message: 'Description is required' },
          minLength: { value: 5, message: 'Minimum length is 5 characters' },
          maxLength: { value: 100, message: 'Maximum length is 100 characters' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Description"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.description?.message}
          />
        )}
        name="description"
      />

      <Image
        source={{
          uri:
            image?.assets[0]?.uri ||
            'https://placehold.co/500x200@2x/grey/white/png?text=Choose+File',
        }}
        style={styles.image}
        onPress={pickImage}
      />

      <Button title="Choose File" onPress={pickImage} disabled={loading} />
      <Button
        title="Upload"
        onPress={handleSubmit(doUpload)}
        loading={loading}
        disabled={!isValid || !image || loading}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default Upload;
