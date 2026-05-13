import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import LevelUpModal from '../components/LevelUpModal';
import { isDevMockAuthEnabled } from '../utils/devAuth';
import { useAuth } from './AuthContext';
import { getPetEmoji } from '../models/pet';

/** @typedef {{ text: string }} LevelUpReward */

const LevelUpContext = createContext(null);

const defaultPreview = {
  prevLevel: 7,
  newLevel: 8,
  petEmoji: '🥚',
  rewards: [{ text: '성실함 +5' }, { text: '집중력 +3' }, { text: '💎 코인 +50' }],
};

function meProgressSnapshot(me) {
  if (!me?.user) return null;
  return {
    level: Math.max(1, Math.floor(Number(me.user.level) || 1)),
    petSig: `${me.pet?.animalType ?? ''}|${me.pet?.evolutionStage ?? ''}`,
  };
}

export function LevelUpProvider({ children }) {
  const { me } = useAuth();
  const prevSnap = useRef(null);
  const [open, setOpen] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);
  const [newLevel, setNewLevel] = useState(2);
  const [petEmoji, setPetEmoji] = useState('🥚');
  const [rewards, setRewards] = useState([]);

  const showLevelUp = useCallback((payload) => {
    const p = payload && typeof payload === 'object' ? payload : {};
    setPrevLevel(
      typeof p.prevLevel === 'number' && Number.isFinite(p.prevLevel) ? p.prevLevel : defaultPreview.prevLevel
    );
    setNewLevel(
      typeof p.newLevel === 'number' && Number.isFinite(p.newLevel)
        ? p.newLevel
        : defaultPreview.newLevel
    );
    setPetEmoji(typeof p.petEmoji === 'string' ? p.petEmoji : defaultPreview.petEmoji);
    const r = Array.isArray(p.rewards) ? p.rewards : defaultPreview.rewards;
    setRewards(
      r.map((x) =>
        typeof x === 'string' ? { text: x } : { text: String(x?.text ?? '') }
      ).filter((x) => x.text)
    );
    setOpen(true);
  }, []);

  const closeLevelUp = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const cur = meProgressSnapshot(me);
    if (!cur) {
      prevSnap.current = null;
      return;
    }
    if (!prevSnap.current) {
      prevSnap.current = cur;
      return;
    }
    const prev = prevSnap.current;
    if (cur.level > prev.level) {
      showLevelUp({
        prevLevel: prev.level,
        newLevel: cur.level,
        petEmoji: getPetEmoji(me.pet?.animalType),
        rewards: [{ text: `레벨 ${cur.level}` }],
      });
    } else if (cur.petSig !== prev.petSig && me.pet) {
      showLevelUp({
        prevLevel: prev.level,
        newLevel: cur.level,
        petEmoji: getPetEmoji(me.pet.animalType),
        rewards: [{ text: '동료 진화!' }],
      });
    }
    prevSnap.current = cur;
  }, [me, showLevelUp]);

  const value = useMemo(
    () => ({ open, prevLevel, newLevel, petEmoji, rewards, showLevelUp, closeLevelUp }),
    [open, prevLevel, newLevel, petEmoji, rewards, showLevelUp, closeLevelUp]
  );

  useEffect(() => {
    if (!isDevMockAuthEnabled() || typeof window === 'undefined') return undefined;
    window.__campusRPG_previewLevelUp = () => showLevelUp(defaultPreview);
    return () => {
      delete window.__campusRPG_previewLevelUp;
    };
  }, [showLevelUp]);

  return (
    <LevelUpContext.Provider value={value}>
      {children}
      <LevelUpModal />
    </LevelUpContext.Provider>
  );
}

export function useLevelUp() {
  const ctx = useContext(LevelUpContext);
  if (!ctx) {
    throw new Error('useLevelUp must be used within LevelUpProvider');
  }
  return ctx;
}

export { defaultPreview };
