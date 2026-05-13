/** Vite 개발 서버 + VITE_DEV_MOCK_AUTH=true 일 때만 목 로그인 허용 */
export function isDevMockAuthEnabled() {
  return import.meta.env.DEV === true && String(import.meta.env.VITE_DEV_MOCK_AUTH ?? '').trim() === 'true';
}
