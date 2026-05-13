/** @typedef {{ id:number, title:string, type:'DAILY'|'WEEKLY', reward_exp:number, reward_stat_type:string|null, reward_stat_amount:number }} QuestTemplate */

export const STAT_TYPES = ['health', 'diligence', 'focus', 'social', 'creativity'];

export const EXP_PER_LEVEL = 1000;
export const DAILY_STAT_GAIN_CAP = 70;

/** Lv1~5→100, 6~10→200, … */
export function maxStatForUserLevel(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  return 100 + 100 * Math.floor((lv - 1) / 5);
}

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

const JUVENILE_BY_STAT = {
  health: '파이루',
  diligence: '워티',
  focus: '스푸티',
  social: '클루',
  creativity: '라니',
};

const ADULT_BY_STAT = {
  health: '파이로소어',
  diligence: '워터북',
  focus: '스프라우트랫',
  social: '클라우드 윙',
  creativity: '라이트닝 혼',
};

export function defaultPetState() {
  return {
    name: '부화중인 알',
    level: 1,
    evolutionStage: 0,
    animalType: 'egg',
    lineageType: null,
    lastEvolvedAt: null,
  };
}

export function defaultStats() {
  return {
    health: 10,
    diligence: 10,
    focus: 10,
    social: 10,
    creativity: 10,
    dailyFatigue: 0,
    lastUpdatedDate: null,
  };
}

function resetDailyStatsIfNeeded(stats) {
  const today = kstYmd();
  const s = { ...defaultStats(), ...stats };
  if (s.lastUpdatedDate !== today) {
    s.dailyFatigue = 0;
    s.lastUpdatedDate = today;
  }
  return s;
}

/**
 * @param {object} pet
 * @param {{ level: number, stats: Record<string, number> }} userSlice
 */
export function evolvePetAfterRewards(pet, userSlice) {
  const p = { ...defaultPetState(), ...pet };
  const lv = userSlice.level;
  const stats = userSlice.stats;
  const eggish = !p.animalType || p.animalType === 'egg';
  const stage = Number(p.evolutionStage) || 0;

  if (stage === 0 && eggish) {
    if (lv >= 6 && STAT_TYPES.some((st) => (Number(stats[st]) || 0) >= 100)) {
      const pick = STAT_TYPES.find((st) => (Number(stats[st]) || 0) >= 100) || 'health';
      return {
        ...p,
        lineageType: pick,
        animalType: JUVENILE_BY_STAT[pick],
        evolutionStage: 1,
        lastEvolvedAt: new Date().toISOString(),
      };
    }
  } else if (stage === 1 && p.lineageType && STAT_TYPES.includes(p.lineageType)) {
    const st = p.lineageType;
    if (lv >= 11 && (Number(stats[st]) || 0) >= 200) {
      return {
        ...p,
        animalType: ADULT_BY_STAT[st],
        evolutionStage: 2,
        lastEvolvedAt: new Date().toISOString(),
      };
    }
  }
  return p;
}

/**
 * 퀘스트 한 줄 보상 적용(스텁·참조 백엔드와 동일 규칙).
 * EXP: 레벨당 1000 초과 시 레벨업·잔여 carry.
 * 스탯: 일일 누적 70·구간별 상한 클램프.
 * @param {{ user?: object, pet?: object }} snapshot
 * @param {{ reward_exp?: number, reward_stat_type?: string|null, reward_stat_amount?: number }} templateRow
 */
export function applyQuestRewardToGameState(snapshot, templateRow) {
  const userIn = snapshot.user || {};
  let level = Math.max(1, Math.floor(Number(userIn.level) || 1));
  let exp = Math.max(0, Math.floor(Number(userIn.exp) || 0));
  let stats = resetDailyStatsIfNeeded(userIn.stats || {});
  const petIn = { ...defaultPetState(), ...(snapshot.pet || {}) };

  const addExp = Math.max(0, Math.floor(Number(templateRow.reward_exp) || 0));
  exp += addExp;
  while (exp >= EXP_PER_LEVEL) {
    exp -= EXP_PER_LEVEL;
    level += 1;
  }

  const st = templateRow.reward_stat_type;
  const rawAmt = Math.max(0, Math.floor(Number(templateRow.reward_stat_amount) || 0));
  let appliedStatAmount = 0;
  if (st && STAT_TYPES.includes(st) && rawAmt > 0) {
    const maxStat = maxStatForUserLevel(level);
    const cur = Number(stats[st]) || 0;
    const fatigue = Number(stats.dailyFatigue) || 0;
    const roomDay = Math.max(0, DAILY_STAT_GAIN_CAP - fatigue);
    const roomStat = Math.max(0, maxStat - cur);
    appliedStatAmount = Math.min(rawAmt, roomDay, roomStat);
    if (appliedStatAmount > 0) {
      stats = {
        ...stats,
        [st]: cur + appliedStatAmount,
        dailyFatigue: fatigue + appliedStatAmount,
        lastUpdatedDate: stats.lastUpdatedDate || kstYmd(),
      };
    }
  }

  const pet = evolvePetAfterRewards(petIn, { level, stats });
  return {
    user: {
      ...userIn,
      level,
      exp,
      coin: Number(userIn.coin) || 0,
      stats,
    },
    pet,
    appliedStatAmount,
  };
}

/**
 * @deprecated 퀘스트 스텁은 {@link applyQuestRewardToGameState} 사용
 */
export function applyRewardToUser(user, templateRow) {
  const out = applyQuestRewardToGameState({ user, pet: user.pet }, templateRow);
  return { exp: out.user.exp, stats: out.user.stats, level: out.user.level, pet: out.pet };
}
