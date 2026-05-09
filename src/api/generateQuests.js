/**
 * LLM 퀘스트 생성. 로컬에서는 Vite 프록시 → quest-api(8787), 배포 시 VITE_QUEST_API_BASE_URL 등 설정.
 */
import { questApiUrl } from './apiBase';

export async function generateQuestsFromLLM({ major, schoolYear, university, realName }) {
  const res = await fetch(questApiUrl('/api/quests/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      major: major || '',
      schoolYear: schoolYear || '',
      university: university || '',
      realName: realName || '',
    }),
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    if (!res.ok) {
      throw new Error(
        raw?.trim()
          ? `퀘스트 API (${res.status}): ${raw.slice(0, 200)}`
          : `퀘스트 API 응답을 읽지 못했습니다 (${res.status}). quest-api(8787)가 켜져 있는지 확인하세요.`
      );
    }
    throw new Error('퀘스트 API 응답이 JSON이 아닙니다.');
  }

  if (!res.ok) {
    const msg =
      data.error ||
      data.message ||
      (typeof data === 'object' && data[0]?.error?.message) ||
      `서버 오류 (${res.status})`;
    throw new Error(msg);
  }

  if (!data.daily || !data.weekly) {
    throw new Error('퀘스트 형식이 올바르지 않습니다.');
  }

  return data;
}
