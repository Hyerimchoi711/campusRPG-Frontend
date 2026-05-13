import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
<<<<<<< HEAD
import { TOKEN_KEY } from '../constants/authStorage';
import { fetchRpgJsonAuth } from '../api/rpgClient';
=======
import { DEV_MOCK_TOKEN, TOKEN_KEY } from '../constants/authStorage';
import { fetchRpgJsonAuth } from '../api/rpgClient';
import { isDevMockAuthEnabled } from '../utils/devAuth';
>>>>>>> origin/whjang
import { useProfile } from './ProfileContext';
import {
  DEFAULT_EGG_PET_NAME,
  getPetEmoji,
  isPetEgg,
  normalizePet,
} from '../models/pet';

const AuthContext = createContext(null);

<<<<<<< HEAD
=======
/** 백엔드 /api/me 없이 로컬 UI만 돌릴 때 사용 */
function buildDevMockMe() {
  const petRaw = {
    name: '부화중인 알',
    level: 1,
    evolutionStage: 0,
    animalType: 'egg',
    lineageType: null,
    lastEvolvedAt: null,
  };
  return {
    user: {
      id: 1,
      nickname: '개발캐릭터',
      universityName: '캠퍼스대학교',
      major: '컴퓨터공학과',
      schoolYear: 2,
      age: 21,
    },
    pet: normalizePet(petRaw),
  };
}

>>>>>>> origin/whjang
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
<<<<<<< HEAD
=======
    if (isDevMockAuthEnabled() && token === DEV_MOCK_TOKEN) {
      const data = buildDevMockMe();
      setMe(data);
      return data;
    }
>>>>>>> origin/whjang
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
