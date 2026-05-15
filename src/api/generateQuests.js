/**
 * 맞춤 퀘스트 생성 — 메인 백엔드 POST /api/quests/generate (JWT 필수)
 */
import { fetchRpgJsonAuth } from './rpgClient';
import { formatLlmQuestRewardLine, sanitizeLlmQuestUiRow } from '../utils/questFormat';

function buildPrompt(profile = {}) {
  const name = profile.realName?.toString().trim();
  const major = profile.major?.toString().trim();
  const year = profile.schoolYear?.toString().trim();
  const uni = profile.university?.toString().trim();

  if (name && major && year) {
    const uniPart = uni ? ` ${uni}` : '';
    return `${name}님,${uniPart} ${major} ${year}학년에 맞는 캠퍼스 일일·주간 퀘스트를 만들어줘`;
  }
  if (major && year) {
    return `${major} ${year}학년에 맞는 캠퍼스 일일·주간 퀘스트를 만들어줘`;
  }
  return '오늘 캠퍼스 생활에 맞는 일일·주간 퀘스트를 만들어줘';
}

function buildContext(profile = {}) {
  return {
    major: profile.major?.toString().trim() || '',
    schoolYear: profile.schoolYear?.toString().trim() || '',
    university: profile.university?.toString().trim() || '',
    realName: profile.realName?.toString().trim() || '',
  };
}

/**
 * @param {'daily'|'weekly'} kind
 * @param {object} q — 서버 quests[] 항목
 */
export function mapGeneratedQuestRow(kind, q) {
  const questId = q.id ?? q.questId ?? q.quest_id;
  const title = typeof q.title === 'string' ? q.title.trim() : '';
  const exp = Number(q.expReward ?? q.exp_reward ?? q.reward_exp) || 0;
  const rawSt = q.rewardStatType ?? q.reward_stat_type;
  const reward_stat_type =
    rawSt != null && String(rawSt).trim() ? String(rawSt).trim() : null;
  const reward_stat_amount = Number(q.rewardStatAmount ?? q.reward_stat_amount) || 0;
  const idKey = questId != null && String(questId).length ? String(questId) : `${Date.now()}`;
  const reward = formatLlmQuestRewardLine({
    reward_exp: exp,
    reward_stat_type,
    reward_stat_amount,
  });
  return {
    id: `${kind}-llm-${idKey}`,
    questId: questId != null ? Number(questId) || questId : null,
    title: title.slice(0, 120),
    reward,
    reward_exp: exp,
    reward_coin: 0,
    reward_stat_type,
    reward_stat_amount,
    done: Boolean(q.completed ?? q.done),
    questSource: 'llm',
  };
}

export function splitQuestsByType(quests) {
  const daily = [];
  const weekly = [];
  for (const q of quests) {
    const type = String(q.type ?? q.questType ?? '').toUpperCase();
    if (type === 'WEEKLY') {
      weekly.push(mapGeneratedQuestRow('weekly', q));
    } else if (type === 'DAILY') {
      daily.push(mapGeneratedQuestRow('daily', q));
    }
  }
  return { daily, weekly };
}

/** @param {Error & { status?: number; data?: object }} err */
export function questGenerateErrorMessage(err) {
  const status = err?.status;
  const code = err?.data?.error ?? err?.message;

  if (status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (status === 404 && code === 'USER_NOT_FOUND') return '계정을 찾을 수 없습니다.';
  if (status === 429 && code === 'GEMINI_RATE_LIMIT') {
    return 'AI 생성 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (status === 502 && code === 'INVALID_LLM_RESPONSE') {
    return '생성된 퀘스트 형식이 올바르지 않습니다. 다시 시도해 주세요.';
  }
  if (status === 503 && code === 'GEMINI_API_KEY_MISSING') {
    return '서버 AI 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.';
  }
  if (status === 500 && code === 'QUEST_GENERATION_FAILED') {
    return '맞춤 퀘스트를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (typeof code === 'string' && code && code !== 'REQUEST_FAILED') return code;
  return err?.message || '맞춤 퀘스트를 받아오지 못했어요.';
}

/**
 * @param {object} profile — major, schoolYear, university, realName
 * @returns {Promise<{ daily: object[], weekly: object[] }>}
 */
export async function generateQuestsFromProfile(profile = {}) {
  const data = await fetchRpgJsonAuth('/api/quests/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: buildPrompt(profile),
      context: buildContext(profile),
    }),
  });

  const quests = Array.isArray(data.quests) ? data.quests : null;
  if (!quests || quests.length === 0) {
    const err = new Error('INVALID_RESPONSE');
    err.status = 502;
    err.data = { error: 'INVALID_LLM_RESPONSE' };
    throw err;
  }

  const { daily, weekly } = splitQuestsByType(quests);
  if (daily.length === 0 && weekly.length === 0) {
    const err = new Error('INVALID_RESPONSE');
    err.status = 502;
    err.data = { error: 'INVALID_LLM_RESPONSE' };
    throw err;
  }

  return { daily, weekly };
}

/** @deprecated generateQuestsFromProfile 사용 */
export async function generateQuestsFromLLM(profile) {
  return generateQuestsFromProfile(profile);
}

export { sanitizeLlmQuestUiRow };
