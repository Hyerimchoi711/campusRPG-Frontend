import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const STORAGE_KEY = 'campusRpg_quests';

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 데모용 기본 퀘스트 (LLM 생성 전) */
export function getDefaultQuestState() {
  const daily = [
    { id: makeId('d'), title: '아침 9시 전 기상', reward: '+50 코인 · 성실함 +1', done: true },
    { id: makeId('d'), title: '강의 출석 완료', reward: '+80 코인 · 성실함 +2', done: true },
    { id: makeId('d'), title: '도서관 2시간 공부', reward: '+120 코인 · 집중력 +2', done: true },
    { id: makeId('d'), title: '과제 제출하기', reward: '+150 코인 · 성실함 +3', done: false },
    { id: makeId('d'), title: '동아리 활동 참여', reward: '+100 코인 · 사교성 +2', done: false },
  ];
  const weekly = [
    { id: makeId('w'), title: '전공 서적 1권 읽기', reward: '+500 코인 · 지능 +5', done: false },
    { id: makeId('w'), title: '운동 3회 이상 하기', reward: '+300 코인 · 건강 +5', done: false },
    { id: makeId('w'), title: '새로운 친구 1명 사귀기', reward: '+400 코인 · 사교성 +5', done: false },
  ];
  return { daily, weekly, source: 'default', generatedAt: null };
}

function normalizeQuestItem(raw, prefix, index) {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const reward = typeof raw.reward === 'string' ? raw.reward.trim() : '+50 코인';
  if (!title) return null;
  return {
    id: raw.id && String(raw.id).length ? String(raw.id) : makeId(prefix),
    title: title.slice(0, 120),
    reward: reward.slice(0, 80),
    done: Boolean(raw.done),
  };
}

function applyGeneratedPayload(payload) {
  const dailyIn = Array.isArray(payload.daily) ? payload.daily : [];
  const weeklyIn = Array.isArray(payload.weekly) ? payload.weekly : [];
  const daily = dailyIn
    .map((q, i) => normalizeQuestItem(q, 'd', i))
    .filter(Boolean)
    .slice(0, 8);
  const weekly = weeklyIn
    .map((q, i) => normalizeQuestItem(q, 'w', i))
    .filter(Boolean)
    .slice(0, 6);
  while (daily.length < 3) {
    daily.push({
      id: makeId('d'),
      title: '캠퍼스 산책 20분',
      reward: '+40 코인',
      done: false,
    });
  }
  while (weekly.length < 2) {
    weekly.push({
      id: makeId('w'),
      title: '이번 주 독서 기록 남기기',
      reward: '+200 코인',
      done: false,
    });
  }
  return {
    daily,
    weekly,
    source: 'llm',
    generatedAt: new Date().toISOString(),
  };
}

const QuestContext = createContext(null);

export const QuestProvider = ({ children }) => {
  const [state, setState] = useState(() => getDefaultQuestState());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.daily || !parsed?.weekly) return;
      setState({
        daily: parsed.daily,
        weekly: parsed.weekly,
        source: parsed.source || 'default',
        generatedAt: parsed.generatedAt || null,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setQuestsFromLLM = useCallback((payload) => {
    const next = applyGeneratedPayload(payload);
    persist(next);
  }, [persist]);

  const resetToDefault = useCallback(() => {
    persist(getDefaultQuestState());
  }, [persist]);

  const commit = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleDaily = useCallback(
    (id) => {
      commit((prev) => ({
        ...prev,
        daily: prev.daily.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
      }));
    },
    [commit]
  );

  const toggleWeekly = useCallback(
    (id) => {
      commit((prev) => ({
        ...prev,
        weekly: prev.weekly.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
      }));
    },
    [commit]
  );

  const value = useMemo(
    () => ({
      dailyQuests: state.daily,
      weeklyQuests: state.weekly,
      questSource: state.source,
      questGeneratedAt: state.generatedAt,
      setQuestsFromLLM,
      resetToDefault,
      toggleDaily,
      toggleWeekly,
    }),
    [state, setQuestsFromLLM, resetToDefault, toggleDaily, toggleWeekly]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
};

export const useQuests = () => {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuests must be used within QuestProvider');
  return ctx;
};
