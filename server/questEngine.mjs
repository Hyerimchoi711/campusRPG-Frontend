/** @typedef {{ id:number, title:string, type:'DAILY'|'WEEKLY', reward_exp:number, reward_stat_type:string|null, reward_stat_amount:number }} QuestTemplate */

export const STAT_TYPES = ['health', 'diligence', 'focus', 'social', 'creativity'];

/** KST 달력 기준 YYYY-MM-DD */
export function kstYmd(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function kstWeekdayShort(ms) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(new Date(ms));
}

/** 해당 KST 날짜의 0시를 나타내는 UTC epoch ms (고정 오프셋 UTC+9) */
export function kstMidnightUtcMsFromYmd(ymd) {
  const [y, mo, d] = ymd.split('-').map(Number);
  return Date.UTC(y, mo - 1, d, 0, 0, 0) - 9 * 3600000;
}

/** KST 기준 그 주의 월요일 YYYY-MM-DD (주간 롤 키) */
export function kstMondayYmdOfKstDate(ymd) {
  let ms = kstMidnightUtcMsFromYmd(ymd);
  for (let i = 0; i < 7; i++) {
    if (kstWeekdayShort(ms) === 'Mon') {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(ms));
    }
    ms -= 86400000;
  }
  return ymd;
}

export function kstWeekRollKey(now = new Date()) {
  const today = kstYmd(now);
  return kstMondayYmdOfKstDate(today);
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, rand) {
  if (!arr.length) return null;
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * @param {QuestTemplate[]} pool
 * @param {string} rollKey
 * @param {number} userId
 */
export function rollDailyFive(pool, rollKey, userId) {
  const dailyPool = pool.filter((q) => q.type === 'DAILY' && q.reward_stat_type && STAT_TYPES.includes(q.reward_stat_type));
  const buckets = new Map();
  for (const st of STAT_TYPES) {
    buckets.set(
      st,
      dailyPool.filter((q) => q.reward_stat_type === st)
    );
  }
  for (const st of STAT_TYPES) {
    if (buckets.get(st).length === 0) {
      throw new Error(`DAILY 풀에 ${st} 스탯 퀘스트가 없습니다.`);
    }
  }
  const seed = hashSeed(`${userId}|${rollKey}|daily`);
  const rand = mulberry32(seed);
  const statOrder = shuffle([...STAT_TYPES], rand);
  const out = [];
  let slot = 0;
  for (const st of statOrder) {
    const choice = pickRandom(buckets.get(st), rand);
    out.push({
      slot: slot++,
      questId: choice.id,
      title: choice.title,
      reward_exp: choice.reward_exp,
      reward_stat_type: choice.reward_stat_type,
      reward_stat_amount: choice.reward_stat_amount,
      completed: false,
      reward_granted_this_slot: false,
    });
  }
  return out;
}

/**
 * @param {QuestTemplate[]} pool
 * @param {string} weekKey Monday ymd
 * @param {number} userId
 */
export function rollWeeklyThree(pool, weekKey, userId) {
  const weeklyPool = pool.filter((q) => q.type === 'WEEKLY' && q.reward_stat_type && STAT_TYPES.includes(q.reward_stat_type));
  const buckets = new Map();
  for (const st of STAT_TYPES) {
    buckets.set(
      st,
      weeklyPool.filter((q) => q.reward_stat_type === st)
    );
  }
  const availableStats = STAT_TYPES.filter((st) => buckets.get(st).length > 0);
  if (availableStats.length < 3) {
    throw new Error('WEEKLY 풀에서 서로 다른 스탯 3종을 만들 수 없습니다.');
  }
  const seed = hashSeed(`${userId}|${weekKey}|weekly`);
  const rand = mulberry32(seed);
  const pickedStats = shuffle(availableStats, rand).slice(0, 3);
  const out = [];
  let slot = 0;
  for (const st of pickedStats) {
    const choice = pickRandom(buckets.get(st), rand);
    out.push({
      slot: slot++,
      questId: choice.id,
      title: choice.title,
      reward_exp: choice.reward_exp,
      reward_stat_type: choice.reward_stat_type,
      reward_stat_amount: choice.reward_stat_amount,
      completed: false,
      reward_granted_this_slot: false,
    });
  }
  return out;
}

function hashSeed(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function applyRewardToUser(user, templateRow) {
  const next = {
    exp: Number(user.exp) || 0,
    stats: { ...defaultStats(), ...(user.stats || {}) },
  };
  const addExp = Number(templateRow.reward_exp) || 0;
  next.exp += addExp;
  const st = templateRow.reward_stat_type;
  const amt = Number(templateRow.reward_stat_amount) || 0;
  if (st && STAT_TYPES.includes(st) && amt) {
    next.stats[st] = (Number(next.stats[st]) || 0) + amt;
  }
  return next;
}

export function defaultStats() {
  return {
    health: 10,
    diligence: 10,
    focus: 10,
    social: 10,
    creativity: 10,
  };
}
