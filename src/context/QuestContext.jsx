import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { TOKEN_KEY, DEV_MOCK_TOKEN, DEV_MOCK_GAME_KEY } from '../constants/authStorage';
import { isDevMockAuthEnabled } from '../utils/devAuth';
import { fetchCurrentQuestSet, patchDailyQuestSlot, patchWeeklyQuestSlot } from '../api/questsClient';
import { mapServerQuestRow, formatPatchRewardsToast } from '../utils/questFormat';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'campusRpg_quests';

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 비로그인·API 실패 시 폴백 */
export function getDefaultQuestState() {
  const daily = [
    { id: makeId('d'), title: '아침 9시 전 기상', reward: '+50 EXP · 성실 +1', done: false },
    { id: makeId('d'), title: '강의 출석 완료', reward: '+80 EXP · 성실 +2', done: false },
    { id: makeId('d'), title: '도서관 2시간 공부', reward: '+120 EXP · 집중 +2', done: false },
    { id: makeId('d'), title: '과제 제출하기', reward: '+150 EXP · 성실 +3', done: false },
    { id: makeId('d'), title: '동아리 활동 참여', reward: '+100 EXP · 사교 +2', done: false },
  ];
  const weekly = [
    { id: makeId('w'), title: '전공 서적 1권 읽기', reward: '+500 EXP · 집중 +5', done: false },
    { id: makeId('w'), title: '운동 3회 이상 하기', reward: '+300 EXP · 건강 +5', done: false },
    { id: makeId('w'), title: '새로운 친구 1명 사귀기', reward: '+400 EXP · 사교 +5', done: false },
  ];
  return {
    daily,
    weekly,
    source: 'default_local',
    generatedAt: null,
    rollDate: null,
    rollWeek: null,
    weekId: null,
  };
}

function normalizeQuestItem(raw, prefix) {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const reward = typeof raw.reward === 'string' ? raw.reward.trim() : '+50 EXP';
  if (!title) return null;
  return {
    id: raw.id && String(raw.id).length ? String(raw.id) : makeId(prefix),
    title: title.slice(0, 120),
    reward: reward.slice(0, 120),
    done: Boolean(raw.done),
    questSource:
      typeof raw.questSource === 'string' && raw.questSource.trim()
        ? raw.questSource.trim()
        : 'llm',
  };
}

function applyGeneratedPayload(payload) {
  const dailyIn = Array.isArray(payload.daily) ? payload.daily : [];
  const weeklyIn = Array.isArray(payload.weekly) ? payload.weekly : [];
  const daily = dailyIn
    .map((q) => normalizeQuestItem(q, 'd'))
    .filter(Boolean)
    .slice(0, 8);
  const weekly = weeklyIn
    .map((q) => normalizeQuestItem(q, 'w'))
    .filter(Boolean)
    .slice(0, 6);
  while (daily.length < 3) {
    daily.push({
      id: makeId('d'),
      title: '캠퍼스 산책 20분',
      reward: '+40 EXP',
      done: false,
    });
  }
  while (weekly.length < 2) {
    weekly.push({
      id: makeId('w'),
      title: '이번 주 독서 기록 남기기',
      reward: '+200 EXP',
      done: false,
    });
  }
  return {
    daily,
    weekly,
    source: 'llm',
    generatedAt: new Date().toISOString(),
    rollDate: null,
    rollWeek: null,
    weekId: null,
  };
}

function persistLlmState(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function mapServerPayloadToState(data) {
  const weekId = data.weekId ?? data.rollWeek ?? null;
  const daily = data.daily.map((r, i) => mapServerQuestRow('daily', { ...r, slot: r.slot ?? i }));
  const weekly = data.weekly.map((r, i) => mapServerQuestRow('weekly', { ...r, slot: r.slot ?? i }));
  return {
    daily,
    weekly,
    source: 'server',
    generatedAt: null,
    rollDate: data.rollDate ?? null,
    rollWeek: weekId,
    weekId,
  };
}

const QuestContext = createContext(null);

export const QuestProvider = ({ children }) => {
  const { refreshMe, mergeQuestGameSnapshotIntoMe } = useAuth();
  const [state, setState] = useState(() => getDefaultQuestState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const [serverSyncLoading, setServerSyncLoading] = useState(false);
  const [serverSyncError, setServerSyncError] = useState('');
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
      setState(getDefaultQuestState());
      return false;
    }
    setServerSyncLoading(true);
    setServerSyncError('');
    try {
      const data = await fetchCurrentQuestSet();
      setState(mapServerPayloadToState(data));
      await mergeUserFromServerResponse(data);
      return true;
    } catch (e) {
      setServerSyncError(e.message || '서버 퀘스트를 불러오지 못했어요.');
      setState(getDefaultQuestState());
      return false;
    } finally {
      setServerSyncLoading(false);
    }
  }, [mergeUserFromServerResponse]);

  useEffect(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    let loadedLlm = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.source === 'llm' && Array.isArray(parsed.daily) && Array.isArray(parsed.weekly)) {
          setState({
            daily: parsed.daily,
            weekly: parsed.weekly,
            source: 'llm',
            generatedAt: parsed.generatedAt || null,
            rollDate: null,
            rollWeek: null,
            weekId: null,
          });
          loadedLlm = true;
        }
      }
    } catch {
      /* ignore */
    }
    if (!loadedLlm && token) {
      loadServerQuests();
    }
  }, [loadServerQuests]);

  const setQuestsFromLLM = useCallback((payload) => {
    const next = applyGeneratedPayload(payload);
    setState(next);
    persistLlmState(next);
  }, []);

  const resetToDefault = useCallback(async () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      await loadServerQuests();
      return;
    }
    const next = getDefaultQuestState();
    setState(next);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [loadServerQuests]);

  const commitLocal = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.source === 'llm') {
        persistLlmState(next);
      }
      return next;
    });
  }, []);

  const clearPatchRewardToast = useCallback(() => {
    setPatchRewardToast('');
  }, []);

  const applyPatchResponse = useCallback(
    async (data) => {
      let mergePayload = data;
      if (data?.daily && data?.weekly) {
        setState(mapServerPayloadToState(data));
      } else if (
        data != null &&
        (data.ok === true || Object.prototype.hasOwnProperty.call(data, 'rewards'))
      ) {
        try {
          const fresh = await fetchCurrentQuestSet();
          setState(mapServerPayloadToState(fresh));
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

  const toggleDaily = useCallback(
    async (id) => {
      const prev = stateRef.current;
      if (prev.source !== 'server') {
        commitLocal((p) => ({
          ...p,
          daily: p.daily.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
        }));
        return;
      }
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
    [commitLocal, applyPatchResponse]
  );

  const toggleWeekly = useCallback(
    async (id) => {
      const prev = stateRef.current;
      if (prev.source !== 'server') {
        commitLocal((p) => ({
          ...p,
          weekly: p.weekly.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
        }));
        return;
      }
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
    [commitLocal, applyPatchResponse]
  );

  const value = useMemo(
    () => ({
      dailyQuests: state.daily,
      weeklyQuests: state.weekly,
      questSource: state.source,
      questGeneratedAt: state.generatedAt,
      rollDate: state.rollDate,
      rollWeek: state.rollWeek,
      weekId: state.weekId,
      patchRewardToast,
      clearPatchRewardToast,
      setQuestsFromLLM,
      resetToDefault,
      toggleDaily,
      toggleWeekly,
      reloadServerQuests: loadServerQuests,
      serverSyncLoading,
      serverSyncError,
    }),
    [
      state,
      setQuestsFromLLM,
      resetToDefault,
      toggleDaily,
      toggleWeekly,
      loadServerQuests,
      serverSyncLoading,
      serverSyncError,
      patchRewardToast,
      clearPatchRewardToast,
    ]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
};

export const useQuests = () => {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuests must be used within QuestProvider');
  return ctx;
};
