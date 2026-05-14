import { fetchRpgJsonAuth } from './rpgClient';

/**
 * 오늘 일정 첫 완료 시 코인 보상(백엔드 1회 지급).
 * @param {{ dateKey: string, clientTodoId: number|string }} params
 * @returns {Promise<{ awarded: boolean, coin?: number, amount?: number }>}
 */
export async function claimTodoCompletionBonus({ dateKey, clientTodoId }) {
  const data = await fetchRpgJsonAuth('/api/me/todo-completion-reward', {
    method: 'POST',
    body: JSON.stringify({ dateKey, clientTodoId }),
  });
  if (!data || typeof data !== 'object') {
    throw new Error('INVALID_RESPONSE');
  }
  return {
    awarded: Boolean(data.awarded),
    coin: typeof data.coin === 'number' ? data.coin : undefined,
    amount: typeof data.amount === 'number' ? data.amount : undefined,
  };
}
