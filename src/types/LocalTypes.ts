import { MediaItemWithOwner, User } from '../types/DBtypes';

export type Credentials = Pick<User, 'username' | 'password'>;
export type RegisterCredentials = Pick<User, 'username' | 'password' | 'email'>;

export type AuthContextType = {
  user: UserWithNoPassword | null;
  handleLogin: (credentials: Credentials) => void;
  handleLogout: () => void;
  handleAutoLogin: () => void;
};

// UserWithNoPassword'a token alanını ekle
export interface UserWithNoPassword {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
  level_name?: string;
  token?: string; // Token'ı isteğe bağlı olarak ekliyoruz
}

export type NavigationType = {
  'All Media': undefined;
  'My Profile': undefined;
  Upload: undefined;
  Tabs: undefined;
  Single: { item: MediaItemWithOwner };
  'My Files': undefined;
  'My media app - login': undefined;
};
