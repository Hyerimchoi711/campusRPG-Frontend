import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TOKEN_KEY } from '../constants/authStorage';
import { fetchRpgJsonAuth } from '../api/rpgClient';
import { useProfile } from './ProfileContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setProfile } = useProfile();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setMe(null);
      return null;
    }
    setLoading(true);
    try {
      const data = await fetchRpgJsonAuth('/api/me');
      setMe(data);
      return data;
    } catch (e) {
      if (e?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setMe(null);
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (!me?.user) return;
    setProfile({
      realName: me.user.nickname,
      university: me.user.universityName || '',
      major: me.user.major || '',
      age: String(me.user.age ?? ''),
      petName: me.pet?.name ?? '알',
      petLevel: me.pet?.level ?? 0,
    });
  }, [me, setProfile]);

  const value = useMemo(
    () => ({ me, loading, refreshMe, logout }),
    [me, loading, refreshMe, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
