/**
 * 회원가입 — DB/API 명세 확정 후 이 함수 본문만 서버 요청으로 교체하면 됩니다.
 *
 * @typedef {Object} RegisterPayload
 * @property {string} studentIdOrEmail 학번 또는 이메일
 * @property {string} nickname 표시 닉네임
 * @property {string} password 비밀번호 (서버에서 해시)
 */

/**
 * @param {RegisterPayload} payload
 * @returns {Promise<{ ok: boolean, code?: string, message?: string }>}
 */
export async function registerUser(payload) {
  void payload;
  /* 예시:
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, code: data.code, message: data.message ?? '가입에 실패했습니다.' };
  return { ok: true };
  */
  return {
    ok: false,
    code: 'NOT_IMPLEMENTED',
    message: '회원가입 서버는 아직 연결되지 않았습니다. 명세 적용 후 api/registerUser.js를 구현해 주세요.',
  };
}
