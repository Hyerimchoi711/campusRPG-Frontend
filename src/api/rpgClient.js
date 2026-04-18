import { apiUrl } from './apiBase';

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

export function formatCoin(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return n.toLocaleString('ko-KR');
}
