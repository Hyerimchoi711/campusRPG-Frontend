/**
 * 맞춤(LLM) 퀘스트 — GET 목록, POST 완료 (슬롯 PATCH 사용 안 함)
 */
import { fetchRpgJsonAuth } from './rpgClient';
import { mapGeneratedQuestRow } from './generateQuests';

/**
 * @param {'DAILY'|'WEEKLY'|'daily'|'weekly'} type
 * @returns {Promise<object[]>} raw server quest rows
 */
export async function fetchCustomQuests(type) {
  const t = String(type).toUpperCase();
  const typeParam = t === 'WEEKLY' ? 'WEEKLY' : 'DAILY';
  const data = await fetchRpgJsonAuth(`/api/quests?type=${typeParam}&source=llm`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.quests)) return data.quests;
  return [];
}

/** @returns {Promise<{ daily: object[], weekly: object[] }>} UI rows */
export async function fetchAllCustomQuests() {
  const [dailyRaw, weeklyRaw] = await Promise.all([
    fetchCustomQuests('DAILY'),
    fetchCustomQuests('WEEKLY'),
  ]);
  return {
    daily: dailyRaw.map((q) => mapGeneratedQuestRow('daily', q)),
    weekly: weeklyRaw.map((q) => mapGeneratedQuestRow('weekly', q)),
  };
}

/**
 * @param {number|string} questId — quests[].id
 */
export async function completeCustomQuest(questId) {
  return fetchRpgJsonAuth(`/api/quests/${encodeURIComponent(String(questId))}/complete`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** @param {Error & { status?: number; data?: object }} err */
export function questCompleteErrorMessage(err) {
  const status = err?.status;
  const code = err?.data?.error ?? err?.message;

  if (status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (status === 409 && code === 'QUEST_ALREADY_COMPLETED') {
    return '이미 완료한 퀘스트예요.';
  }
  if (typeof code === 'string' && code && code !== 'REQUEST_FAILED') return code;
  return err?.message || '퀘스트 완료 처리에 실패했어요.';
}
