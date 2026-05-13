/** DB reward_stat_type → 한글 (퀘스트·스탯 UI 공통) */
export const QUEST_STAT_LABEL_KO = {
  health: '건강',
  diligence: '성실',
  focus: '집중',
  social: '사교',
  creativity: '창의',
};

/**
 * @param {{ reward_exp?: number, reward_stat_type?: string|null, reward_stat_amount?: number }} row
 */
export function formatQuestRewardLine(row) {
  const exp = Number(row.reward_exp) || 0;
  const st = row.reward_stat_type && String(row.reward_stat_type).trim();
  const amt = Number(row.reward_stat_amount) || 0;
  const expPart = exp > 0 ? `+${exp.toLocaleString('ko-KR')} EXP` : '';
  if (st && QUEST_STAT_LABEL_KO[st] && amt > 0) {
    const label = QUEST_STAT_LABEL_KO[st];
    return expPart ? `${expPart} · ${label} +${amt}` : `${label} +${amt}`;
  }
  return expPart || '보상 없음';
}

/**
 * 서버 슬롯 응답 → UI 퀘스트 행
 * @param {'daily'|'weekly'} kind
 * @param {object} row
 */
export function mapServerQuestRow(kind, row) {
  const id = `${kind}-${row.slot}-${row.questId}`;
  return {
    id,
    serverKind: kind,
    serverSlot: row.slot,
    questId: row.questId,
    title: row.title,
    reward: formatQuestRewardLine(row),
    done: Boolean(row.completed),
    reward_granted_this_slot: Boolean(row.reward_granted_this_slot),
    reward_exp: row.reward_exp,
    reward_stat_type: row.reward_stat_type,
    reward_stat_amount: row.reward_stat_amount,
  };
}
