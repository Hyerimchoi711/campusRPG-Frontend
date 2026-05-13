import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEV_MOCK_TOKEN, TOKEN_KEY, DEV_MOCK_GAME_KEY } from '../constants/authStorage';
import { fetchRpgJsonAuth } from '../api/rpgClient';
import { isDevMockAuthEnabled } from '../utils/devAuth';
import { useProfile } from './ProfileContext';
import {
  DEFAULT_EGG_PET_NAME,
  getPetEmoji,
  isPetEgg,
  normalizePet,
} from '../models/pet';

const AuthContext = createContext(null);

const DEV_MOCK_USER_STATS_BASE = {
  health: 45,
  social: 55,
  diligence: 72,
  focus: 80,
  creativity: 63,
  dailyFatigue: 30,
  lastUpdatedDate: null,
};

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
      level: 1,
      exp: 0,
      coin: 0,
      stats: { ...DEV_MOCK_USER_STATS_BASE },
    },
    pet: normalizePet(petRaw),
  };
}

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
    if (isDevMockAuthEnabled() && token === DEV_MOCK_TOKEN) {
      const data = buildDevMockMe();
      try {
        const raw = localStorage.getItem(DEV_MOCK_GAME_KEY);
        if (raw) {
          const g = JSON.parse(raw);
          if (g && typeof g === 'object') {
            if (g.v === 1) {
              if (g.exp != null && Number.isFinite(Number(g.exp))) data.user.exp = Math.floor(Number(g.exp));
              if (g.level != null && Number.isFinite(Number(g.level))) data.user.level = Math.max(1, Math.floor(Number(g.level)));
              if (g.coin != null && Number.isFinite(Number(g.coin))) data.user.coin = Math.floor(Number(g.coin));
              if (g.stats && typeof g.stats === 'object') {
                data.user.stats = { ...DEV_MOCK_USER_STATS_BASE, ...g.stats };
              }
              if (g.pet && typeof g.pet === 'object') {
                data.pet = normalizePet(g.pet);
              }
            } else {
              if (g.exp != null && Number.isFinite(Number(g.exp))) data.user.exp = Math.floor(Number(g.exp));
              if (g.level != null && Number.isFinite(Number(g.level))) data.user.level = Math.max(1, Math.floor(Number(g.level)));
              if (g.coin != null && Number.isFinite(Number(g.coin))) data.user.coin = Math.floor(Number(g.coin));
              if (g.stats && typeof g.stats === 'object') {
                data.user.stats = { ...DEV_MOCK_USER_STATS_BASE, ...g.stats };
              }
            }
          }
        }
      } catch {
        /* ignore */
      }
      setMe(data);
      return data;
    }
    setLoading(true);
    try {
      const data = await fetchRpgJsonAuth('/api/me');
      if (token !== DEV_MOCK_TOKEN) {
        try {
          localStorage.removeItem(DEV_MOCK_GAME_KEY);
        } catch {
          /* ignore */
        }
      }
      if (data && typeof data === 'object' && 'pet' in data) {
        data.pet = data.pet ? normalizePet(data.pet) : null;
      }
      if (data?.user && data.user.level == null) {
        data.user.level = 1;
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

  /** GET /api/me로 받은 프로필(닉네임 등)은 유지하고, 퀘스트 current·PATCH 응답의 게임 필드만 덮어씁니다. */
  const mergeQuestGameSnapshotIntoMe = useCallback((payload) => {
    if (!payload?.user || typeof payload.user !== 'object') return;
    setMe((prev) => {
      if (!prev?.user) return prev;
      const src = payload.user;
      const nextUser = { ...prev.user };
      if (src.level != null && Number.isFinite(Number(src.level))) {
        nextUser.level = Math.max(1, Math.floor(Number(src.level)));
      }
      if (src.exp != null && Number.isFinite(Number(src.exp))) {
        nextUser.exp = Math.floor(Number(src.exp));
      }
      if (src.coin != null && Number.isFinite(Number(src.coin))) {
        nextUser.coin = Math.floor(Number(src.coin));
      }
      if (src.stats != null && typeof src.stats === 'object') {
        const base =
          prev.user.stats && typeof prev.user.stats === 'object' ? prev.user.stats : {};
        nextUser.stats = { ...base, ...src.stats };
      }
      let pet = prev.pet;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'pet')) {
        pet = payload.pet ? normalizePet(payload.pet) : null;
      }
      return { ...prev, user: nextUser, pet };
    });
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
      petLevel:
        me.user.level != null && Number.isFinite(Number(me.user.level))
          ? Math.max(1, Math.floor(Number(me.user.level)))
          : p?.level ?? 1,
      petStage: isPetEgg(p) ? 'egg' : 'hatched',
      petEmoji: p ? getPetEmoji(p.animalType) : '🥚',
      petLineageType: p?.lineageType ?? null,
      petAnimalType: p?.animalType ?? 'egg',
      petLastEvolvedAt: p?.lastEvolvedAt ?? null,
    });
  }, [me, setProfile]);

  const value = useMemo(
    () => ({ me, loading, refreshMe, mergeQuestGameSnapshotIntoMe, logout }),
    [me, loading, refreshMe, mergeQuestGameSnapshotIntoMe, logout]
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
