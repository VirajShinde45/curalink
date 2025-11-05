import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, UserPreference } from './supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreference | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userType: 'patient' | 'researcher') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreference>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user on mount
    async function loadUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          await loadUserData(currentUser.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Listen for auth changes (no async operations in callback!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          loadUserData(session.user.id);
        } else {
          setProfile(null);
          setPreferences(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(userId: string, retryCount = 0) {
    console.log(`Loading user data for user: ${userId}, attempt: ${retryCount + 1}`);
    
    try {
      // Load profile with retry logic
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Profile query result:', { 
        profileData, 
        profileError, 
        userId,
        hasData: !!profileData,
        errorCode: profileError?.code 
      });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          console.log(`Retrying profile load (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            loadUserData(userId, retryCount + 1);
          }, Math.pow(2, retryCount) * 1000);
          return;
        }
      } else {
        setProfile(profileData);
        console.log('Profile set in state:', profileData);
      }

      // Load preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preference')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        console.error('Error loading preferences:', preferencesError);
      } else {
        setPreferences(preferencesData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Retry on network errors
      if (retryCount < 3) {
        console.log(`Retrying user data load (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          loadUserData(userId, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
      }
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, userType: 'patient' | 'researcher') {
    console.log('Starting signup process for:', { email, userType });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          user_type: userType,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    console.log('Auth signup successful:', { 
      userId: data.user?.id, 
      email: data.user?.email,
      needsConfirmation: !data.session 
    });

    // Profile and preferences are now created automatically by database trigger
    // Just load the user data to sync with the frontend state
    if (data.user) {
      console.log('Loading user data after signup...');
      await loadUserData(data.user.id);
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPreferences(null);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return;

    const { error } = await supabase
      .from('user_profile')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
  }

  async function updatePreferences(updates: Partial<UserPreference>) {
    if (!user) return;

    const { error } = await supabase
      .from('user_preference')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error && preferences) {
      setPreferences({ ...preferences, ...updates });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
