import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const STORAGE_KEY = 'campusRpg_userProfile';

const PROFILE_KEYS = [
  'realName',
  'university',
  'major',
  'schoolYear',
  'age',
  'intro',
  'avatar',
  'petStage',
  'petLevel',
  'petName',
  'petEmoji',
];

/** 게임 프로필 (상단 바·프로필 페이지 공통) */
const defaultProfile = {
  realName: '김민준',
  university: '한국대학교',
  major: '컴퓨터공학과',
  schoolYear: '2',
  age: '21',
  intro: 'CampusQuest로 캠퍼스 라이프 레벨업!',
  avatar: '🥚',
  petStage: 'egg',
  petLevel: 0,
  petName: '알',
  petEmoji: '🥚',
};

function normalizePetLevel(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return defaultProfile.petLevel;
  return Math.floor(n);
}

function normalizePetStage(v) {
  return v === 'hatched' ? 'hatched' : 'egg';
}

function pickProfile(merged) {
  const next = { ...defaultProfile };
  PROFILE_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(merged, k)) {
      next[k] = merged[k];
    }
  });
  next.petStage = normalizePetStage(next.petStage);
  next.petLevel = normalizePetLevel(next.petLevel);
  if (typeof next.petName !== 'string') next.petName = defaultProfile.petName;
  if (typeof next.petEmoji !== 'string') next.petEmoji = defaultProfile.petEmoji;
  return next;
}

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfileState] = useState(defaultProfile);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfileState(pickProfile({ ...defaultProfile, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setProfile = useCallback((next) => {
    setProfileState((prev) => {
      const merged = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      const clean = pickProfile(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      } catch {
        /* ignore */
      }
      return clean;
    });
  }, []);

  const value = useMemo(() => ({ profile, setProfile }), [profile, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
};
