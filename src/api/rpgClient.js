import { apiUrl } from './apiBase';
import { TOKEN_KEY } from '../constants/authStorage';

/**
 * fetchRpgJson — 로그인 불필요: GET /api/items, 퀘스트 등 (본문은 호출부에서 판단).
 * fetchRpgJsonAuth — Bearer 필수: /api/me, /api/wallet, /api/inventory*, 친구·유저 등 (백엔드 스펙과 일치).
 */
export async function fetchRpgJson(path, options = {}) {
  const url = path.startsWith('http') ? path : apiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'REQUEST_FAILED');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Bearer JWT가 필요한 API */
export async function fetchRpgJsonAuth(path, options = {}) {
  const url = path.startsWith('http') ? path : apiUrl(path);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    const err = new Error(data.error || data.message || res.statusText || 'REQUEST_FAILED');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function formatCoin(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return n.toLocaleString('ko-KR');
}
