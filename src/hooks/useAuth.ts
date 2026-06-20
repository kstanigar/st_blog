import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { usePostHog } from '@posthog/react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const posthog = usePostHog();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        posthog?.identify(u.id, { email: u.email, created_at: u.created_at });
        posthog?.capture('user logged in', { email });
      }
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      posthog?.identify(data.user.id, { email: data.user.email, created_at: data.user.created_at });
      posthog?.capture('user signed up', { email });
    }
    return { error };
  };

  const signOut = async () => {
    posthog?.capture('user logged out');
    posthog?.reset();
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signUp, signOut };
}
