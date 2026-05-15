import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { TOKEN_KEY, DEV_MOCK_TOKEN, DEV_MOCK_GAME_KEY } from '../constants/authStorage';
import { isDevMockAuthEnabled } from '../utils/devAuth';
import { fetchCurrentQuestSet, patchDailyQuestSlot, patchWeeklyQuestSlot } from '../api/questsClient';
import { fetchAllCustomQuests, completeCustomQuest, questCompleteErrorMessage } from '../api/customQuestsClient';
import {
  mapServerQuestRow,
  formatPatchRewardsToast,
  formatLlmPatchRewardsToast,
  sanitizeLlmQuestUiRow,
} from '../utils/questFormat';
import { useAuth } from './AuthContext';

const CUSTOM_STORAGE_KEY = 'campusRpg_custom_quests';

const emptyServer = {
  daily: [],
  weekly: [],
  rollDate: null,
  rollWeek: null,
  weekId: null,
};

const emptyCustom = {
  daily: [],
  weekly: [],
  generatedAt: null,
};

function persistCustomCache(custom) {
  try {
    localStorage.setItem(
      CUSTOM_STORAGE_KEY,
      JSON.stringify({
        daily: custom.daily,
        weekly: custom.weekly,
        generatedAt: custom.generatedAt,
      })
    );
  } catch {
    /* ignore */
  }
}

function loadCustomCache() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.daily) || !Array.isArray(parsed.weekly)) return null;
    return {
      daily: parsed.daily.map(sanitizeLlmQuestUiRow),
      weekly: parsed.weekly.map(sanitizeLlmQuestUiRow),
      generatedAt: parsed.generatedAt || null,
    };
  } catch {
    return null;
  }
}

function mapServerPayloadToState(data) {
  const weekId = data.weekId ?? data.rollWeek ?? null;
  const daily = data.daily.map((r, i) => mapServerQuestRow('daily', { ...r, slot: r.slot ?? i }));
  const weekly = data.weekly.map((r, i) => mapServerQuestRow('weekly', { ...r, slot: r.slot ?? i }));
  return {
    daily,
    weekly,
    rollDate: data.rollDate ?? null,
    rollWeek: weekId,
    weekId,
  };
}

const QuestContext = createContext(null);

export const QuestProvider = ({ children }) => {
  const { refreshMe, mergeQuestGameSnapshotIntoMe } = useAuth();
  const [activeTab, setActiveTab] = useState('server');
  const [serverState, setServerState] = useState(emptyServer);
  const [customState, setCustomState] = useState(emptyCustom);
  const serverRef = useRef(serverState);
  const customRef = useRef(customState);
  serverRef.current = serverState;
  customRef.current = customState;

  const [serverSyncLoading, setServerSyncLoading] = useState(false);
  const [customSyncLoading, setCustomSyncLoading] = useState(false);
  const [serverSyncError, setServerSyncError] = useState('');
  const [customSyncError, setCustomSyncError] = useState('');
  const [patchRewardToast, setPatchRewardToast] = useState('');

  const mergeUserFromServerResponse = useCallback(
    async (data) => {
      if (data?.user) {
        try {
          if (isDevMockAuthEnabled() && localStorage.getItem(TOKEN_KEY) === DEV_MOCK_TOKEN) {
            let prev = null;
            try {
              const rawPrev = localStorage.getItem(DEV_MOCK_GAME_KEY);
              if (rawPrev) prev = JSON.parse(rawPrev);
            } catch {
              /* ignore */
            }
            const game = {
              v: 1,
              level: data.user.level,
              exp: data.user.exp,
              coin: data.user.coin,
              stats: data.user.stats,
              pet: data.pet != null ? data.pet : prev?.v === 1 ? prev.pet : null,
            };
            localStorage.setItem(DEV_MOCK_GAME_KEY, JSON.stringify(game));
          }
        } catch {
          /* ignore */
        }
      }
      await refreshMe?.();
      if (data?.user) {
        mergeQuestGameSnapshotIntoMe?.(data);
      }
    },
    [refreshMe, mergeQuestGameSnapshotIntoMe]
  );

  const loadServerQuests = useCallback(async () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setServerSyncError('');
      setServerState(emptyServer);
      return false;
    }
    setServerSyncLoading(true);
    setServerSyncError('');
    try {
      const data = await fetchCurrentQuestSet();
      setServerState(mapServerPayloadToState(data));
      await mergeUserFromServerResponse(data);
      return true;
    } catch (e) {
      setServerSyncError(e.message || '기본 퀘스트를 불러오지 못했어요.');
      setServerState(emptyServer);
      return false;
    } finally {
      setServerSyncLoading(false);
    }
  }, [mergeUserFromServerResponse]);

  const loadCustomQuests = useCallback(async () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setCustomSyncError('');
      setCustomState(emptyCustom);
      return false;
    }
    setCustomSyncLoading(true);
    setCustomSyncError('');
    try {
      const { daily, weekly } = await fetchAllCustomQuests();
      const next = {
        daily: daily.map(sanitizeLlmQuestUiRow),
        weekly: weekly.map(sanitizeLlmQuestUiRow),
        generatedAt: customRef.current.generatedAt,
      };
      setCustomState(next);
      persistCustomCache(next);
      return true;
    } catch (e) {
      const cached = loadCustomCache();
      if (cached) {
        setCustomState(cached);
        setCustomSyncError('');
        return true;
      }
      setCustomSyncError(e.message || '맞춤 퀘스트를 불러오지 못했어요.');
      return false;
    } finally {
      setCustomSyncLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) return;
    loadServerQuests();
    loadCustomQuests();
  }, [loadServerQuests, loadCustomQuests]);

  const setQuestsFromGenerateResponse = useCallback((payload) => {
    const dailyIn = Array.isArray(payload?.daily) ? payload.daily : [];
    const weeklyIn = Array.isArray(payload?.weekly) ? payload.weekly : [];
    const daily = dailyIn.filter((q) => q?.title).map(sanitizeLlmQuestUiRow);
    const weekly = weeklyIn.filter((q) => q?.title).map(sanitizeLlmQuestUiRow);
    const next = {
      daily,
      weekly,
      generatedAt: new Date().toISOString(),
    };
    setCustomState(next);
    persistCustomCache(next);
    setActiveTab('custom');
  }, []);

  const resetToDefault = useCallback(async () => {
    setActiveTab('server');
    setServerSyncError('');
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      await loadServerQuests();
    }
  }, [loadServerQuests]);

  const clearPatchRewardToast = useCallback(() => {
    setPatchRewardToast('');
  }, []);

  const applyPatchResponse = useCallback(
    async (data) => {
      let mergePayload = data;
      if (data?.daily && data?.weekly) {
        setServerState(mapServerPayloadToState(data));
      } else if (
        data != null &&
        (data.ok === true || Object.prototype.hasOwnProperty.call(data, 'rewards'))
      ) {
        try {
          const fresh = await fetchCurrentQuestSet();
          setServerState(mapServerPayloadToState(fresh));
          mergePayload = fresh;
        } catch (e) {
          setServerSyncError(e.message || '퀘스트를 다시 불러오지 못했어요.');
        }
        if (data.rewards != null && typeof data.rewards === 'object') {
          const msg = formatPatchRewardsToast(data.rewards);
          if (msg) setPatchRewardToast(msg);
        }
      }
      await mergeUserFromServerResponse(mergePayload);
    },
    [mergeUserFromServerResponse]
  );

  const toggleServerDaily = useCallback(
    async (id) => {
      const prev = serverRef.current;
      const row = prev.daily.find((q) => q.id === id);
      if (row == null || row.serverSlot == null) return;
      const nextDone = !row.done;
      setServerSyncError('');
      try {
        const data = await patchDailyQuestSlot(row.serverSlot, nextDone);
        await applyPatchResponse(data);
      } catch (e) {
        setServerSyncError(e.message || '상태를 저장하지 못했어요.');
      }
    },
    [applyPatchResponse]
  );

  const toggleServerWeekly = useCallback(
    async (id) => {
      const prev = serverRef.current;
      const row = prev.weekly.find((q) => q.id === id);
      if (row == null || row.serverSlot == null) return;
      const nextDone = !row.done;
      setServerSyncError('');
      try {
        const data = await patchWeeklyQuestSlot(row.serverSlot, nextDone);
        await applyPatchResponse(data);
      } catch (e) {
        setServerSyncError(e.message || '상태를 저장하지 못했어요.');
      }
    },
    [applyPatchResponse]
  );

  const markCustomDone = useCallback((kind, uiId) => {
    setCustomState((c) => {
      const key = kind === 'daily' ? 'daily' : 'weekly';
      const next = {
        ...c,
        [key]: c[key].map((q) => (q.id === uiId ? { ...q, done: true } : q)),
      };
      persistCustomCache(next);
      return next;
    });
  }, []);

  const completeCustomQuestById = useCallback(
    async (kind, uiId) => {
      const prev = customRef.current;
      const list = kind === 'daily' ? prev.daily : prev.weekly;
      const row = list.find((q) => q.id === uiId);
      if (!row || row.done || row.questId == null) return;

      setCustomSyncError('');
      try {
        const data = await completeCustomQuest(row.questId);
        markCustomDone(kind, uiId);
        if (data?.rewards != null && typeof data.rewards === 'object') {
          const msg = formatLlmPatchRewardsToast(data.rewards);
          if (msg) setPatchRewardToast(msg);
        }
        await refreshMe?.();
      } catch (e) {
        if (e.status === 409) {
          markCustomDone(kind, uiId);
          setPatchRewardToast(questCompleteErrorMessage(e));
          await refreshMe?.();
          return;
        }
        setCustomSyncError(questCompleteErrorMessage(e));
      }
    },
    [markCustomDone, refreshMe]
  );

  const completeCustomDaily = useCallback(
    (id) => completeCustomQuestById('daily', id),
    [completeCustomQuestById]
  );

  const completeCustomWeekly = useCallback(
    (id) => completeCustomQuestById('weekly', id),
    [completeCustomQuestById]
  );

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      serverDailyQuests: serverState.daily,
      serverWeeklyQuests: serverState.weekly,
      customDailyQuests: customState.daily,
      customWeeklyQuests: customState.weekly,
      customGeneratedAt: customState.generatedAt,
      rollDate: serverState.rollDate,
      rollWeek: serverState.rollWeek,
      weekId: serverState.weekId,
      patchRewardToast,
      clearPatchRewardToast,
      setQuestsFromGenerateResponse,
      resetToDefault,
      toggleServerDaily,
      toggleServerWeekly,
      completeCustomDaily,
      completeCustomWeekly,
      reloadServerQuests: loadServerQuests,
      reloadCustomQuests: loadCustomQuests,
      serverSyncLoading,
      customSyncLoading,
      serverSyncError,
      customSyncError,
      dailyQuests: activeTab === 'custom' ? customState.daily : serverState.daily,
      weeklyQuests: activeTab === 'custom' ? customState.weekly : serverState.weekly,
      questSource: activeTab === 'custom' ? 'llm' : 'server',
      questGeneratedAt: customState.generatedAt,
      toggleDaily: activeTab === 'custom' ? completeCustomDaily : toggleServerDaily,
      toggleWeekly: activeTab === 'custom' ? completeCustomWeekly : toggleServerWeekly,
    }),
    [
      activeTab,
      serverState,
      customState,
      patchRewardToast,
      clearPatchRewardToast,
      setQuestsFromGenerateResponse,
      resetToDefault,
      toggleServerDaily,
      toggleServerWeekly,
      completeCustomDaily,
      completeCustomWeekly,
      loadServerQuests,
      loadCustomQuests,
      serverSyncLoading,
      customSyncLoading,
      serverSyncError,
      customSyncError,
    ]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
};

export const useQuests = () => {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuests must be used within QuestProvider');
  return ctx;
};
