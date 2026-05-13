import { fetchRpgJsonAuth } from './rpgClient';

/**
 * GET /api/me/quests/current — 일일 5·주간 3 (서버 롤)
 */
export async function fetchCurrentQuestSet() {
  const data = await fetchRpgJsonAuth('/api/me/quests/current');
  if (!data || typeof data !== 'object') {
    throw new Error('퀘스트 응답 형식이 올바르지 않습니다.');
  }
  if (!Array.isArray(data.daily) || !Array.isArray(data.weekly)) {
    throw new Error('퀘스트 목록이 없습니다.');
  }
  return data;
}

export async function patchDailyQuestSlot(slot, completed) {
  return fetchRpgJsonAuth('/api/me/quests/daily', {
    method: 'PATCH',
    body: JSON.stringify({ slot, completed }),
  });
}

export async function patchWeeklyQuestSlot(slot, completed) {
  return fetchRpgJsonAuth('/api/me/quests/weekly', {
    method: 'PATCH',
    body: JSON.stringify({ slot, completed }),
  });
}
