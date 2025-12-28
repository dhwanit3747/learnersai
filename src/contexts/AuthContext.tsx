import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, profileApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  streak_days: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const profileData = await profileApi.get();
          const tokens = authApi.getTokens();
          if (tokens) {
            // Decode user info from token or fetch from profile
            setUser({ id: profileData.id, email: '' });
            setProfile(profileData);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authApi.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { user: newUser } = await authApi.register(email, password, displayName);
      setUser(newUser);
      const profileData = await profileApi.get();
      setProfile(profileData);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, profile: userProfile } = await authApi.login(email, password);
      setUser(loggedInUser);
      setProfile(userProfile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    authApi.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
