/**
 * 로컬 quest API로 LLM 퀘스트 생성 (Vite 프록시 → server/quest-api)
 * 서버 미실행 시 네트워크 에러 — UI에서 안내
 */
export async function generateQuestsFromLLM({ major, schoolYear, university, realName }) {
  const res = await fetch('/api/quests/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      major: major || '',
      schoolYear: schoolYear || '',
      university: university || '',
      realName: realName || '',
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || data.message || `서버 오류 (${res.status})`;
    throw new Error(msg);
  }

  if (!data.daily || !data.weekly) {
    throw new Error('퀘스트 형식이 올바르지 않습니다.');
  }

  return data;
}
