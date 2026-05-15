/** DB reward_stat_type → 한글 (퀘스트·스탯 UI 공통) */
export const QUEST_STAT_LABEL_KO = {
  health: '건강',
  diligence: '성실',
  focus: '집중',
  social: '사교',
  creativity: '창의',
};

/**
 * 서버 슬롯 한 줄(camelCase·snake_case) → UI/보상 문자열용 정규 객체
 * @param {object} raw
 */
export function normalizeQuestSlotRow(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      assignmentId: null,
      slot: 0,
      questId: null,
      title: '',
      reward_exp: 0,
      reward_coin: 0,
      reward_stat_type: null,
      reward_stat_amount: 0,
      completed: false,
      reward_granted_this_slot: false,
      quest_source: 'default',
    };
  }
  const assignmentId = raw.assignmentId ?? raw.assignment_id ?? null;
  const slotNum = Number(raw.slot);
  const questId = raw.questId ?? raw.quest_id;
  const title = typeof raw.title === 'string' ? raw.title : '';
  const reward_exp = Number(raw.rewardExp ?? raw.reward_exp) || 0;
  const reward_coin = Number(raw.rewardCoin ?? raw.reward_coin) || 0;
  const rawSt = raw.rewardStatType ?? raw.reward_stat_type;
  const reward_stat_type =
    rawSt != null && String(rawSt).trim() ? String(rawSt).trim() : null;
  const reward_stat_amount = Number(raw.rewardStatAmount ?? raw.reward_stat_amount) || 0;
  const completed = Boolean(raw.completed);
  const reward_granted_this_slot = Boolean(
    raw.rewardGrantedThisSlot ?? raw.reward_granted_this_slot
  );
  const qs = raw.questSource ?? raw.quest_source;
  const quest_source =
    typeof qs === 'string' && qs.trim() ? qs.trim() : 'default';
  return {
    assignmentId,
    slot: Number.isFinite(slotNum) && slotNum >= 0 ? slotNum : 0,
    questId,
    title,
    reward_exp,
    reward_coin,
    reward_stat_type,
    reward_stat_amount,
    completed,
    reward_granted_this_slot,
    quest_source,
  };
}

/**
 * @param {object} row — raw 슬롯 또는 {@link normalizeQuestSlotRow} 결과
 */
export function formatQuestRewardLine(row) {
  const n = normalizeQuestSlotRow(row);
  const exp = n.reward_exp;
  const coin = n.reward_coin;
  const st = n.reward_stat_type && QUEST_STAT_LABEL_KO[n.reward_stat_type] ? n.reward_stat_type : null;
  const amt = n.reward_stat_amount;
  const parts = [];
  if (exp > 0) parts.push(`+${exp.toLocaleString('ko-KR')} EXP`);
  if (coin > 0) parts.push(`+${coin.toLocaleString('ko-KR')} 코인`);
  const base = parts.join(' · ');
  if (st && amt > 0) {
    const label = QUEST_STAT_LABEL_KO[st];
    return base ? `${base} · ${label} +${amt}` : `${label} +${amt}`;
  }
  return base || '보상 없음';
}

/**
 * PATCH 후 `rewards` 객체 → 짧은 토스트 문구
 * @param {object} rewards
 */
export function formatPatchRewardsToast(rewards) {
  if (!rewards || typeof rewards !== 'object') return '';
  const exp = Number(rewards.exp ?? rewards.rewardExp) || 0;
  const coin = Number(rewards.coin ?? rewards.rewardCoin) || 0;
  const stRaw = rewards.statType ?? rewards.rewardStatType ?? rewards.stat_type;
  const st = stRaw != null && String(stRaw).trim() ? String(stRaw).trim() : null;
  const amt = Number(rewards.statAmount ?? rewards.rewardStatAmount ?? rewards.stat_amount) || 0;
  const parts = [];
  if (exp > 0) parts.push(`EXP +${exp.toLocaleString('ko-KR')}`);
  if (coin > 0) parts.push(`코인 +${coin.toLocaleString('ko-KR')}`);
  if (st && QUEST_STAT_LABEL_KO[st] && amt > 0) {
    parts.push(`${QUEST_STAT_LABEL_KO[st]} +${amt}`);
  }
  return parts.length ? `보상: ${parts.join(' · ')}` : '';
}

/** 맞춤(LLM) 퀘스트 카드 보상 — 코인 항상 제외 */
export function formatLlmQuestRewardLine(fields) {
  return formatQuestRewardLine({
    reward_exp: fields?.reward_exp ?? fields?.rewardExp ?? fields?.expReward ?? 0,
    reward_coin: 0,
    reward_stat_type: fields?.reward_stat_type ?? fields?.rewardStatType ?? null,
    reward_stat_amount: fields?.reward_stat_amount ?? fields?.rewardStatAmount ?? 0,
  });
}

/** 맞춤 퀘스트 완료 토스트 — 서버가 coin>0 을 돌려도 표시하지 않음 */
export function formatLlmPatchRewardsToast(rewards) {
  if (!rewards || typeof rewards !== 'object') return '';
  return formatPatchRewardsToast({
    exp: rewards.exp ?? rewards.rewardExp,
    coin: 0,
    rewardCoin: 0,
    statType: rewards.statType ?? rewards.rewardStatType ?? rewards.stat_type,
    statAmount: rewards.statAmount ?? rewards.rewardStatAmount ?? rewards.stat_amount,
  });
}

/** localStorage·레거시 행 정규화 */
export function sanitizeLlmQuestUiRow(row) {
  if (!row || typeof row !== 'object') return row;
  const exp =
    Number(row.reward_exp ?? row.rewardExp ?? row.expReward) || 0;
  const reward_stat_type = row.reward_stat_type ?? row.rewardStatType ?? null;
  const reward_stat_amount =
    Number(row.reward_stat_amount ?? row.rewardStatAmount) || 0;
  return {
    ...row,
    reward_exp: exp,
    reward_coin: 0,
    questSource: 'llm',
    reward: formatLlmQuestRewardLine({
      reward_exp: exp,
      reward_stat_type,
      reward_stat_amount,
    }),
  };
}

/**
 * 서버 슬롯 응답 → UI 퀘스트 행
 * @param {'daily'|'weekly'} kind
 * @param {object} row
 */
export function mapServerQuestRow(kind, row) {
  const n = normalizeQuestSlotRow(row);
  const id =
    n.assignmentId != null && String(n.assignmentId).length
      ? `${kind}-${String(n.assignmentId)}`
      : `${kind}-${n.slot}-${n.questId}`;
  return {
    id,
    serverKind: kind,
    serverSlot: n.slot,
    questId: n.questId,
    assignmentId: n.assignmentId,
    title: n.title,
    reward: formatQuestRewardLine(n),
    done: n.completed,
    reward_granted_this_slot: n.reward_granted_this_slot,
    reward_exp: n.reward_exp,
    reward_coin: n.reward_coin,
    reward_stat_type: n.reward_stat_type,
    reward_stat_amount: n.reward_stat_amount,
    questSource: n.quest_source,
  };
}
