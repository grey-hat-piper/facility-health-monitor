import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PASSWORD = 'facilityadmin';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('facility_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (password !== CORRECT_PASSWORD) {
      return { success: false, error: 'Invalid password' };
    }

    if (!username.trim()) {
      return { success: false, error: 'Username is required' };
    }

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username.trim())
        .maybeSingle();

      if (fetchError) throw fetchError;

      let userData: User;

      if (existingUser) {
        // Update last login
        await supabase
          .from('app_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);
        
        userData = { id: existingUser.id, username: existingUser.username };
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('app_users')
          .insert({ username: username.trim() })
          .select()
          .single();

        if (insertError) throw insertError;
        userData = { id: newUser.id, username: newUser.username };
      }

      setUser(userData);
      localStorage.setItem('facility_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Failed to login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('facility_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
