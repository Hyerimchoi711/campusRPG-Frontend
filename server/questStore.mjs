import {
  kstYmd,
  kstWeekRollKey,
  rollDailyFive,
  rollWeeklyThree,
  applyQuestRewardToGameState,
  defaultStats,
  defaultPetState,
} from './questEngine.mjs';

const TODO_BONUS_AMOUNT = 100;

/** Node 프로세스 로컬 타임존 기준 YYYY-MM-DD (개발 스텁에서 브라우저 `toDateKey`와 맞추기) */
function localCalendarYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class QuestRuntimeStore {
  /** @param {import('./questEngine.mjs').QuestTemplate[]} templates */
  constructor(templates) {
    this.templates = templates;
    /** @type {Map<number, { level: number, exp: number, coin: number, stats: Record<string, number>, pet: object }>} */
    this.users = new Map();
    /** @type {Map<string, ReturnType<typeof rollDailyFive>>} */
    this.dailyRolls = new Map();
    /** @type {Map<string, ReturnType<typeof rollWeeklyThree>>} */
    this.weeklyRolls = new Map();
    /** @type {Set<string>} — `${userId}:${dateKey}:${clientTodoId}` KST dateKey, 멱등 */
    this.todoCompletionBonusKeys = new Set();
  }

  ensureUser(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        level: 1,
        exp: 0,
        coin: 0,
        stats: defaultStats(),
        pet: defaultPetState(),
      });
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

  slotToApiCamel(kind, userId, rollKey, row) {
    const prefix = kind === 'daily' ? 'd' : 'w';
    return {
      assignmentId: `${prefix}-${userId}-${rollKey}-${row.slot}`,
      slot: row.slot,
      questId: row.questId,
      title: row.title,
      rewardExp: row.reward_exp,
      rewardCoin: 0,
      rewardStatType: row.reward_stat_type,
      rewardStatAmount: row.reward_stat_amount,
      completed: row.completed,
      rewardGrantedThisSlot: row.reward_granted_this_slot,
      questSource: 'default',
    };
  }

  getCurrentPayload(userId) {
    this.ensureUser(userId);
    const rollDate = kstYmd();
    const rollWeek = kstWeekRollKey();
    const weekId = rollWeek;
    const daily = this.getOrCreateDailyRoll(userId, rollDate);
    const weekly = this.getOrCreateWeeklyRoll(userId, rollWeek);
    const u = this.users.get(userId);
    return {
      rollDate,
      weekId,
      rollWeek: weekId,
      daily: daily.map((row) => this.slotToApiCamel('daily', userId, rollDate, row)),
      weekly: weekly.map((row) => this.slotToApiCamel('weekly', userId, weekId, row)),
      user: {
        level: u.level,
        exp: u.exp,
        coin: u.coin || 0,
        stats: { ...u.stats },
      },
      pet: { ...u.pet },
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
    const u = this.users.get(userId);
    const petBeforeStr = JSON.stringify(u.pet);
    let appliedStatForToast = 0;
    if (!prev && next && !row.reward_granted_this_slot) {
      const out = applyQuestRewardToGameState(
        {
          user: {
            level: u.level ?? 1,
            exp: u.exp ?? 0,
            coin: u.coin ?? 0,
            stats: u.stats,
          },
          pet: u.pet,
        },
        row
      );
      appliedStatForToast = out.appliedStatAmount;
      u.level = out.user.level;
      u.exp = out.user.exp;
      u.stats = out.user.stats;
      u.coin = out.user.coin;
      u.pet = out.pet;
      row.reward_granted_this_slot = true;
      rewardApplied = true;
    }

    let rewards = null;
    if (rewardApplied) {
      rewards = {
        exp: Number(row.reward_exp) || 0,
        coin: 0,
        statType: row.reward_stat_type,
        statAmount: appliedStatForToast,
        dailyFatigue: Number(u.stats?.dailyFatigue) || 0,
        level: u.level,
        petEvolved: JSON.stringify(u.pet) !== petBeforeStr,
      };
    }
    return { ok: true, rewards };
  }

  /**
   * 일정 완료 보너스(스텁·참조 백엔드). dateKey는 KST 오늘과 일치할 때만 지급.
   * @param {number} userId
   * @param {string} dateKey YYYY-MM-DD
   * @param {string|number} clientTodoId
   * @returns {{ awarded: boolean, coin: number, amount?: number }}
   */
  claimTodoCompletionBonus(userId, dateKey, clientTodoId) {
    this.ensureUser(userId);
    const todayKst = kstYmd();
    const todayLocal = localCalendarYmd();
    if (typeof dateKey !== 'string' || (dateKey !== todayKst && dateKey !== todayLocal)) {
      const err = new Error('NOT_TODAY');
      err.status = 400;
      err.code = 'NOT_TODAY';
      throw err;
    }
    const idPart = String(clientTodoId ?? '').trim();
    if (!idPart) {
      const err = new Error('INVALID_CLIENT_TODO_ID');
      err.status = 400;
      throw err;
    }
    const key = `${userId}:${dateKey}:${idPart}`;
    const u = this.users.get(userId);
    const coin0 = Number(u.coin) || 0;
    if (this.todoCompletionBonusKeys.has(key)) {
      return { awarded: false, coin: coin0 };
    }
    this.todoCompletionBonusKeys.add(key);
    u.coin = coin0 + TODO_BONUS_AMOUNT;
    return { awarded: true, coin: u.coin, amount: TODO_BONUS_AMOUNT };
  }
}
