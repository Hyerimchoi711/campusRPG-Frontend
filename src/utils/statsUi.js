/** /api/me user.stats → StatsPage 레이더·바용 UI 스탯 (diligence ↔ diligent 등) */
export { meMaxStatForUserLevel, ME_EXP_PER_LEVEL, ME_DAILY_STAT_GAIN_CAP, resolveMaxStatPerLine } from '../api/meContract.js';
export function mapServerStatsToUi(stats) {
  if (!stats || typeof stats !== 'object') return null;
  return {
    health: Number(stats.health) || 0,
    social: Number(stats.social) || 0,
    diligent: Number(stats.diligence ?? stats.diligent) || 0,
    focus: Number(stats.focus) || 0,
    creative: Number(stats.creativity ?? stats.creative) || 0,
  };
}

export function getDailyFatigueFromStats(stats) {
  if (!stats || typeof stats !== 'object') return 0;
  const v = stats.dailyFatigue ?? stats.daily_fatigue;
  return Math.max(0, Number(v) || 0);
}
