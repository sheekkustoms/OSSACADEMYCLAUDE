import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, getCurrentUser, signOut } from './supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      if (!u) setAuthError({ type: 'auth_required' });
      setIsLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
        setAuthError(null);
      } else {
        setUser(null);
        setAuthError({ type: 'auth_required' });
      }
      setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navigateToLogin = () => { window.location.href = '/Login'; };
  const logout = async () => { await signOut(); window.location.href = '/Login'; };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
