/** 로컬 설정 (향후 오디오 등에서 읽기) */
export const SETTINGS_KEYS = {
  masterVolume: 'campusRpg_settings_masterVolume',
  bgmEnabled: 'campusRpg_settings_bgm',
  sfxEnabled: 'campusRpg_settings_sfx',
  notifications: 'campusRpg_settings_notifications',
};

export function getMasterVolume() {
  const v = Number(localStorage.getItem(SETTINGS_KEYS.masterVolume));
  if (!Number.isFinite(v) || v < 0 || v > 100) return 80;
  return Math.round(v);
}

export function getBgmEnabled() {
  return localStorage.getItem(SETTINGS_KEYS.bgmEnabled) !== '0';
}

export function getSfxEnabled() {
  return localStorage.getItem(SETTINGS_KEYS.sfxEnabled) !== '0';
}
