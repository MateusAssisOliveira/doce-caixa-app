
'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(currentUser => {
        setUser(currentUser);
        setIsUserLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // If auth is not available, we are not loading a user
      setIsUserLoading(false);
    }
  }, [auth]);

  return { user, isUserLoading };
};
