/**
 * 가방·아이템 사용 API
 */
import { fetchRpgJsonAuth } from './rpgClient';

export const ITEM_EFFECT = {
  FATIGUE_RECOVERY: 'FATIGUE_RECOVERY',
  EXP_BOOST: 'EXP_BOOST',
  STAT_BOOST: 'STAT_BOOST',
  STAT_RESET: 'STAT_RESET',
  NAME_CHANGE: 'NAME_CHANGE',
  RANDOM_STAT: 'RANDOM_STAT',
};

/**
 * @param {object} raw
 * @returns {object|null}
 */
export function normalizeInventoryRow(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw.inventoryEntryId ?? raw.inventory_entry_id;
  const quantity = Number(raw.quantity) || 0;
  if (id == null && quantity <= 0) return null;

  return {
    id: id != null ? Number(id) || id : null,
    itemId: raw.itemId ?? raw.item_id ?? null,
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    quantity: Math.max(0, quantity),
    imageUrl: raw.imageUrl ?? raw.image_url ?? null,
    iconEmoji: raw.iconEmoji ?? raw.icon_emoji ?? null,
    effectType: raw.effectType ?? raw.effect_type ?? null,
  };
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchInventory() {
  const data = await fetchRpgJsonAuth('/api/inventory');
  const rows = Array.isArray(data) ? data : Array.isArray(data?.inventory) ? data.inventory : [];
  return rows.map(normalizeInventoryRow).filter((r) => r && r.quantity > 0);
}

/**
 * @param {number|string} inventoryEntryId — user_inventory.id
 */
export async function useInventoryItem(inventoryEntryId) {
  return fetchRpgJsonAuth('/api/inventory/use', {
    method: 'POST',
    body: JSON.stringify({ inventoryEntryId }),
  });
}

/** @param {object} row */
export function isFatigueRecoveryItem(row) {
  if (!row) return false;
  const effect = String(row.effectType || '').toUpperCase();
  if (effect === ITEM_EFFECT.FATIGUE_RECOVERY) return true;
  return row.name.includes('에너지 드링크');
}

/**
 * @param {object} row
 * @param {object} [data] — use API 응답
 */
export function buildInventoryUseSuccessMessage(row, data) {
  const base =
    (typeof data?.message === 'string' && data.message.trim()) ||
    `「${row.name}」을(를) 사용했습니다.`;

  if (!isFatigueRecoveryItem(row)) return base;

  const effects = data?.effects;
  const delta = Number(effects?.fatigueDelta ?? effects?.fatigue_delta);
  if (Number.isFinite(delta) && delta < 0) {
    return `${base} (피로도 ${Math.abs(delta)} 감소)`;
  }
  return `${base} 피로도가 회복되었습니다.`;
}

/** @param {Error & { status?: number; data?: object }} err */
export function inventoryUseErrorMessage(err) {
  const status = err?.status;
  const code = err?.data?.error ?? err?.message;

  if (status === 401) return '로그인이 필요합니다.';
  if (status === 404 && code === 'INVENTORY_ENTRY_NOT_FOUND') {
    return '아이템을 찾을 수 없습니다.';
  }
  if (status === 409 && code === 'INSUFFICIENT_QUANTITY') {
    return '보유 수량이 없습니다.';
  }
  if (status === 400 && code === 'ITEM_NOT_USABLE') {
    return '지금은 사용할 수 없는 아이템입니다.';
  }
  if (status === 404) {
    return '아이템 사용 API가 아직 준비되지 않았습니다. 백엔드 연동 후 다시 시도해 주세요.';
  }
  if (typeof code === 'string' && code && code !== 'REQUEST_FAILED') return code;
  return err?.message || '아이템을 사용하지 못했습니다.';
}
