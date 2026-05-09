import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchRpgJsonAuth } from '../api/rpgClient';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'campusRpg_demoUserId';

const GameUserContext = createContext(null);

export const GameUserProvider = ({ children }) => {
  const { me } = useAuth();

  const userId = useMemo(() => {
    const id = me?.user?.id;
    if (id != null && Number.isInteger(Number(id)) && Number(id) >= 1) {
      return Number(id);
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const n = Number(raw);
      if (Number.isInteger(n) && n >= 1) return n;
    } catch {
      /* ignore */
    }
    return 1;
  }, [me?.user?.id]);

  const [coins, setCoins] = useState(null);
  const [inventoryBump, setInventoryBump] = useState(0);

  const refreshWallet = useCallback(async () => {
    try {
      const d = await fetchRpgJsonAuth(`/api/wallet?userId=${userId}`);
      setCoins(typeof d.coin === 'number' ? d.coin : null);
    } catch {
      setCoins(null);
    }
  }, [userId]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const applyPurchaseResult = useCallback((payload) => {
    if (payload && typeof payload.coin === 'number') {
      setCoins(payload.coin);
    }
    setInventoryBump((b) => b + 1);
  }, []);

  const value = useMemo(
    () => ({
      userId,
      coins,
      refreshWallet,
      applyPurchaseResult,
      inventoryBump,
    }),
    [userId, coins, refreshWallet, applyPurchaseResult, inventoryBump]
  );

  return <GameUserContext.Provider value={value}>{children}</GameUserContext.Provider>;
};

export function useGameUser() {
  const ctx = useContext(GameUserContext);
  if (!ctx) {
    throw new Error('useGameUser must be used within GameUserProvider');
  }
  return ctx;
}
