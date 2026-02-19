import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, email: string, position: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const login = async (username: string, email: string, position: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Verify password server-side via edge function
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-password', {
        body: { password },
      });

      if (verifyError) {
        return { success: false, error: 'Unable to verify password. Please try again.' };
      }

      if (!verifyData?.valid) {
        return { success: false, error: 'Invalid password' };
      }
    } catch {
      return { success: false, error: 'Unable to verify password. Please try again.' };
    }

    if (!username.trim()) {
      return { success: false, error: 'Username is required' };
    }

    if (!email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    // School email validation
    if (!email.trim().endsWith('@lgc.edu.gh')) {
      return { success: false, error: 'Only school emails (@lgc.edu.gh) are allowed' };
    }

    try {
      // Check if user exists by username
      const { data: existingUser, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username.trim())
        .maybeSingle();

      if (fetchError) throw fetchError;

      let userData: User;

      if (existingUser) {
        // Update last login and email
        await supabase
          .from('app_users')
          .update({ 
            last_login: new Date().toISOString(),
            email: email.trim(),
            position: position.trim() || null
          })
          .eq('id', existingUser.id);
        
        userData = { id: existingUser.id, username: existingUser.username, email: email.trim() };
      } else {
        // Create new user with email
        const { data: newUser, error: insertError } = await supabase
          .from('app_users')
          .insert({ 
            username: username.trim(),
            email: email.trim(),
            position: position.trim() || null
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userData = { id: newUser.id, username: newUser.username, email: newUser.email };
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
