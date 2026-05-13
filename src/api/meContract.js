/**
 * GET /api/me 응답 계약 (백엔드·프론트 공유).
 * 실제 백엔드는 이 스키마를 맞추고, 프론트는 snake_case 폴백 없이 camelCase 우선 수용.
 *
 * @typedef {Object} ApiMeUserStats
 * @property {number} [health]
 * @property {number} [diligence]
 * @property {number} [focus]
 * @property {number} [social]
 * @property {number} [creativity]
 * @property {number} [dailyFatigue] — 퀘스트로 오늘 누적된 스탯 포인트(0~70). 백엔드가 `quest_daily_stat_sum`만 쓰는 경우 이 값에 매핑될 수 있음
 * @property {number} [questDailyStatSum] — 선택: DB `quest_daily_stat_sum`을 그대로 노출할 때
 * @property {number} [quest_daily_stat_sum] — snake_case 폴백(선택)
 * @property {string|null} [lastUpdatedDate] — KST YYYY-MM-DD
 *
 * @typedef {Object} ApiMeUser
 * @property {number} id
 * @property {string} [nickname]
 * @property {number} [maxStatPerStat] — 스탯 한 줄 상한(백엔드 고정값). 있으면 `meMaxStatForUserLevel`보다 우선
 * @property {number} [max_stat_per_stat] — snake_case 폴백(선택)
 * @property {number} [level] — 캐릭터 레벨(1+). 레벨당 EXP 상한 1000 구간과 연동
 * @property {number} [exp] — 현재 레벨 구간 내 경험치(0~999 권장)
 * @property {number} [coin]
 * @property {ApiMeUserStats} [stats]
 *
 * @typedef {Object} ApiMePet
 * @property {number|null} [id]
 * @property {string} [name]
 * @property {number} [level]
 * @property {number} [evolutionStage] — 0: 알, 1: 유아기, 2: 성체
 * @property {string} [animalType] — egg | 파이루 | … (pet.js와 동일)
 * @property {string|null} [lineageType] — health | diligence | …
 * @property {string|null} [lastEvolvedAt]
 *
 * @typedef {Object} ApiMeResponse
 * @property {ApiMeUser} user
 * @property {ApiMePet|null} pet
 */

export const ME_EXP_PER_LEVEL = 1000;
export const ME_DAILY_STAT_GAIN_CAP = 70;

/** 레벨 구간별 스탯 한 줄 상한: Lv1~5→100, 6~10→200, … */
export function meMaxStatForUserLevel(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  return 100 + 100 * Math.floor((lv - 1) / 5);
}

/**
 * 스탯 바·차트 한 줄 최대값. 백엔드 `user.maxStatPerStat`가 있으면 우선, 없으면 레벨 구간식.
 * @param {ApiMeUser | Record<string, unknown> | null | undefined} user
 */
export function resolveMaxStatPerLine(user) {
  if (!user || typeof user !== 'object') return meMaxStatForUserLevel(1);
  const o = /** @type {Record<string, unknown>} */ (user);
  const fixed = Number(o.maxStatPerStat ?? o.max_stat_per_stat);
  if (Number.isFinite(fixed) && fixed > 0) return Math.floor(fixed);
  const lv = Math.max(1, Math.floor(Number(o.level) || 1));
  return meMaxStatForUserLevel(lv);
}
