import { useEffect, useState } from 'react';
import { api, type AdminUser } from '@/lib/api';

export interface AdminSession {
  user: AdminUser;
}

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.me()
      .then(({ user }) => {
        if (cancelled) return;
        setSession({ user });
        setIsAdmin(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
        setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, isAdmin, loading };
}
