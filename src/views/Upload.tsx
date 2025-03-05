import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Button, Card, Input} from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import {StyleSheet, Alert, Image, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NavigationType} from '../types/LocalTypes';
import {useFile} from '../hooks/apiHooks';
import {useUserContext} from '../hooks/ContextHooks';

type UploadInputs = {
  title: string;
  description: string;
};

const Upload = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<NavigationType>>();
  const {user} = useUserContext();
  const {postExpoFile, loading} = useFile();

  const initValues: UploadInputs = {title: '', description: ''};
  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
    reset,
  } = useForm<UploadInputs>({
    defaultValues: initValues,
    mode: 'onChange',
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // Use a simple mediaTypes value compatible with both platforms
        mediaTypes:
          Platform.OS === 'web'
            ? undefined // Web defaults to all media types
            : ImagePicker.MediaTypeOptions.All, // Native uses deprecated but functional option
        allowsEditing: true,
        quality: 0.6,
      });

      console.log(result);

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

    try {
      if (!user) {
        throw new Error('User not logged in');
      }
      const fileResult = await postExpoFile(image.assets[0].uri, user.token);
      if (!fileResult) {
        throw new Error('File upload failed');
      }

      reset();
      setImage(null);
      navigation.navigate('All Media');
    } catch (error) {
      console.error('doUpload failed:', error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <Card>
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'Title is required'},
          minLength: {value: 3, message: 'Minimum length is 3 characters'},
        }}
        render={({field: {onChange, onBlur, value}}) => (
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
          required: {value: true, message: 'Description is required'},
          minLength: {value: 5, message: 'Minimum length is 5 characters'},
          maxLength: {value: 100, message: 'Maximum length is 100 characters'},
        }}
        render={({field: {onChange, onBlur, value}}) => (
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
