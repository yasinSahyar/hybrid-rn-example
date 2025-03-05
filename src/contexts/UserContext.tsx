import React, { createContext, useState } from 'react';
import { useAuthentication, useUser } from '../hooks/apiHooks';
import { AuthContextType, Credentials } from '../types/LocalTypes';
import { UserWithNoPassword } from 'hybrid-types/DBTypes';
import { UserResponse } from 'hybrid-types/MessageTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const UserContext = createContext<AuthContextType | null>(null);

// Extend UserWithNoPassword to include token
interface UserWithToken extends UserWithNoPassword {
  token?: string;
}

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithToken | null>(null);
  const { postLogin } = useAuthentication();
  const { getUserByToken } = useUser();

  const handleLogin = async (credentials: Credentials) => {
    try {
      const loginResult = await postLogin(credentials);
      console.log('doLogin result:', loginResult);
      if (loginResult && loginResult.token) {
        await AsyncStorage.setItem('token', loginResult.token);
        // Token'ı user nesnesine ekle
        setUser({ ...loginResult.user, token: loginResult.token });
      } else {
        throw new Error('No token received from login');
      }
    } catch (e) {
      console.log('Login error:', (e as Error).message);
      Alert.alert('Login failed!', (e as Error).message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (e) {
      console.log('Logout error:', (e as Error).message);
    }
  };

  const handleAutoLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('AutoLogin token:', token);
      if (!token) {
        return;
      }
      const userResponse: UserResponse = await getUserByToken(token);
      console.log('AutoLogin user:', userResponse.user);
      // Token'ı user nesnesine ekle
      setUser({ ...userResponse.user, token });
    } catch (e) {
      console.log('AutoLogin error:', (e as Error).message);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, handleLogin, handleLogout, handleAutoLogin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
