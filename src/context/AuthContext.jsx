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
import {
  DEFAULT_EGG_PET_NAME,
  getPetEmoji,
  isPetEgg,
  normalizePet,
} from '../models/pet';

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
      if (data && typeof data === 'object' && 'pet' in data) {
        data.pet = data.pet ? normalizePet(data.pet) : null;
      }
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
    const p = me.pet;
    setProfile({
      realName: me.user.nickname,
      university: me.user.universityName || '',
      major: me.user.major || '',
      schoolYear:
        me.user.schoolYear != null && String(me.user.schoolYear).trim() !== ''
          ? String(me.user.schoolYear).trim()
          : me.user.school_year != null && String(me.user.school_year).trim() !== ''
            ? String(me.user.school_year).trim()
            : '',
      age: String(me.user.age ?? ''),
      petName: p?.name ?? DEFAULT_EGG_PET_NAME,
      petLevel: p?.level ?? 1,
      petStage: isPetEgg(p) ? 'egg' : 'hatched',
      petEmoji: p ? getPetEmoji(p.animalType) : '🥚',
      petLineageType: p?.lineageType ?? null,
      petAnimalType: p?.animalType ?? 'egg',
      petLastEvolvedAt: p?.lastEvolvedAt ?? null,
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
