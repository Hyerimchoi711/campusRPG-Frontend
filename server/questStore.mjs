import {
  kstYmd,
  kstWeekRollKey,
  rollDailyFive,
  rollWeeklyThree,
  applyRewardToUser,
  defaultStats,
} from './questEngine.mjs';

export class QuestRuntimeStore {
  /** @param {import('./questEngine.mjs').QuestTemplate[]} templates */
  constructor(templates) {
    this.templates = templates;
    /** @type {Map<number, { exp: number, stats: Record<string, number> }>} */
    this.users = new Map();
    /** @type {Map<string, ReturnType<typeof rollDailyFive>>} */
    this.dailyRolls = new Map();
    /** @type {Map<string, ReturnType<typeof rollWeeklyThree>>} */
    this.weeklyRolls = new Map();
  }

  ensureUser(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, { exp: 0, stats: defaultStats() });
    }
    return this.users.get(userId);
  }

  dailyKey(userId, dateStr) {
    return `${userId}:${dateStr}`;
  }

  weeklyKey(userId, weekKey) {
    return `${userId}:${weekKey}`;
  }

  getOrCreateDailyRoll(userId, dateStr) {
    const k = this.dailyKey(userId, dateStr);
    if (!this.dailyRolls.has(k)) {
      this.dailyRolls.set(k, rollDailyFive(this.templates, dateStr, userId));
    }
    return this.dailyRolls.get(k);
  }

  getOrCreateWeeklyRoll(userId, weekKey) {
    const k = this.weeklyKey(userId, weekKey);
    if (!this.weeklyRolls.has(k)) {
      this.weeklyRolls.set(k, rollWeeklyThree(this.templates, weekKey, userId));
    }
    return this.weeklyRolls.get(k);
  }

  getCurrentPayload(userId) {
    this.ensureUser(userId);
    const rollDate = kstYmd();
    const rollWeek = kstWeekRollKey();
    const daily = this.getOrCreateDailyRoll(userId, rollDate);
    const weekly = this.getOrCreateWeeklyRoll(userId, rollWeek);
    const u = this.users.get(userId);
    return {
      rollDate,
      rollWeek,
      daily: daily.map((row) => ({ ...row })),
      weekly: weekly.map((row) => ({ ...row })),
      user: { exp: u.exp, stats: { ...u.stats } },
    };
  }

  /**
   * @param {'daily'|'weekly'} kind
   * @param {number} slot
   * @param {boolean} completed
   */
  patchSlot(userId, kind, slot, completed) {
    this.ensureUser(userId);
    const rollDate = kstYmd();
    const rollWeek = kstWeekRollKey();
    const daily = this.getOrCreateDailyRoll(userId, rollDate);
    const weekly = this.getOrCreateWeeklyRoll(userId, rollWeek);
    const list = kind === 'daily' ? daily : weekly;
    const max = kind === 'daily' ? 5 : 3;
    if (slot < 0 || slot >= max || !Number.isInteger(slot)) {
      const err = new Error('유효하지 않은 슬롯입니다.');
      err.status = 400;
      throw err;
    }
    const row = list[slot];
    const prev = Boolean(row.completed);
    const next = Boolean(completed);
    row.completed = next;

    let rewardApplied = false;
    if (!prev && next && !row.reward_granted_this_slot) {
      const u = this.users.get(userId);
      const updated = applyRewardToUser(u, row);
      u.exp = updated.exp;
      u.stats = updated.stats;
      row.reward_granted_this_slot = true;
      rewardApplied = true;
    }

    const u = this.users.get(userId);
    return {
      rewardApplied,
      rollDate,
      rollWeek,
      daily: daily.map((r) => ({ ...r })),
      weekly: weekly.map((r) => ({ ...r })),
      user: { exp: u.exp, stats: { ...u.stats } },
    };
  }
}
