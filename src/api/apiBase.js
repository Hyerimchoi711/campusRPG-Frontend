/**
 * 배포 시 프론트·백 도메인이 다르면 빌드 전에 VITE_API_BASE_URL 등을 설정합니다.
 * 로컬에서는 비워 두면 상대 경로(/api/...)로 요청되어 Vite 프록시가 동작합니다.
 */
function stripTrailingSlash(s) {
  return s.replace(/\/+$/, '');
}

export function getApiBase() {
  const b = import.meta.env.VITE_API_BASE_URL;
  if (b == null || String(b).trim() === '') return '';
  return stripTrailingSlash(String(b).trim());
}

/** 메인 게임 API (auth, me, wallet, items, inventory …) */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${p}` : p;
}

/** 퀘스트 LLM API가 메인과 다른 베이스일 때 (미설정 시 메인 API와 동일) */
export function questApiUrl(path) {
  const q = import.meta.env.VITE_QUEST_API_BASE_URL;
  const base =
    q != null && String(q).trim() !== ''
      ? stripTrailingSlash(String(q).trim())
      : getApiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
