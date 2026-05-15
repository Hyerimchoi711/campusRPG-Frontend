import { fetchRpgJsonAuth } from './rpgClient';
import { normalizePet } from '../models/pet';

/** @typedef {{ userId: string, nickname: string, avatar: string, intro: string, sortOrder: number }} NormalizedFriend */

/** @typedef {{ id: string, fromUserId?: string, nickname: string, intro: string, avatar: string }} FriendRequestRow */
function asString(v) {
  if (v == null) return '';
  return String(v);
}

/**
 * @param {unknown} raw
 * @returns {NormalizedFriend}
 */
export function normalizeFriendRow(raw) {
  if (!raw || typeof raw !== 'object') {
    return { userId: '', nickname: '', avatar: '🥚', intro: '', sortOrder: 0 };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const userId =
    o.userId ??
    o.friendUserId ??
    o.id ??
    o.user_id ??
    o.friend_user_id ??
    o.toUserId ??
    o.to_user_id;
  return {
    userId: asString(userId),
    nickname: asString(o.nickname ?? o.realName ?? o.name).trim(),
    avatar: asString(o.avatar ?? '🥚') || '🥚',
    intro: asString(o.intro ?? ''),
    sortOrder: Number(o.sortOrder ?? o.sort_order ?? 0) || 0,
  };
}

/**
 * @returns {Promise<NormalizedFriend[]>}
 */
export async function fetchFriendsList() {
  const data = await fetchRpgJsonAuth('/api/friends');
  const rows = Array.isArray(data) ? data : data.friends ?? data.items ?? [];
  const list = rows.map(normalizeFriendRow).filter((r) => r.userId);
  list.sort((a, b) => a.sortOrder - b.sortOrder || a.nickname.localeCompare(b.nickname));
  return list;
}

/**
 * @returns {Promise<FriendRequestRow[]>}
 */
export async function fetchIncomingFriendRequests() {
  const data = await fetchRpgJsonAuth('/api/friends/requests/incoming');
  const rows = Array.isArray(data) ? data : data.requests ?? [];
  return rows
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const o = /** @type {Record<string, unknown>} */ (raw);
      const id = o.id ?? o.requestId;
      if (id == null) return null;
      return {
        id: asString(id),
        fromUserId: o.fromUserId != null ? asString(o.fromUserId) : o.from_user_id != null ? asString(o.from_user_id) : undefined,
        nickname: asString(o.nickname ?? o.fromNickname ?? '').trim(),
        intro: asString(o.intro ?? ''),
        avatar: asString(o.avatar ?? '🥚') || '🥚',
      };
    })
    .filter(Boolean);
}

/**
 * @param {string} friendCode
 */
export async function sendFriendRequestByCode(friendCode) {
  const code = String(friendCode ?? '').trim();
  return fetchRpgJsonAuth('/api/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ friendCode: code }),
  });
}

/**
 * @param {string} requestId
 */
export async function acceptFriendRequest(requestId) {
  return fetchRpgJsonAuth(`/api/friends/requests/${encodeURIComponent(requestId)}/accept`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * @param {string} requestId
 */
export async function rejectFriendRequest(requestId) {
  return fetchRpgJsonAuth(`/api/friends/requests/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * @param {string} friendUserId
 */
export async function deleteFriend(friendUserId) {
  return fetchRpgJsonAuth(`/api/friends/${encodeURIComponent(friendUserId)}`, {
    method: 'DELETE',
  });
}

/**
 * @param {string[]} orderedUserIds
 */
export async function patchFriendsOrder(orderedUserIds) {
  return fetchRpgJsonAuth('/api/friends/order', {
    method: 'PATCH',
    body: JSON.stringify({ orderedUserIds }),
  });
}

/**
 * 공개 프로필 (친구 상세)
 * @param {string} userId
 */
/**
 * GET /api/users/:id 응답에서 사용자 객체 추출 (백엔드 래퍼 형태 호환)
 * @param {unknown} data
 */
function extractUserObjectFromUsersResponse(data) {
  if (data == null || typeof data !== 'object') return null;
  const root = /** @type {Record<string, unknown>} */ (data);
  const nested = root.data;
  const fromNested =
    nested && typeof nested === 'object' && /** @type {Record<string, unknown>} */ (nested).user != null
      ? /** @type {Record<string, unknown>} */ (nested).user
      : null;
  const candidates = [
    root.user,
    root.User,
    fromNested,
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? /** @type {Record<string, unknown>} */ (nested)
      : null,
  ];
  for (const c of candidates) {
    if (c != null && typeof c === 'object' && !Array.isArray(c)) {
      return /** @type {Record<string, unknown>} */ (c);
    }
  }
  if (root.id != null || root.userId != null || root.nickname != null) {
    return root;
  }
  return null;
}

/** GET /api/users/:id — /api/me 와 같이 루트·data 래퍼의 pet 형제 필드 */
function extractPetFromUsersResponse(data) {
  if (data == null || typeof data !== 'object') return null;
  const root = /** @type {Record<string, unknown>} */ (data);
  const nested =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? /** @type {Record<string, unknown>} */ (root.data)
      : null;
  const raw = root.pet ?? nested?.pet ?? null;
  if (raw == null || typeof raw !== 'object') return null;
  return normalizePet(raw);
}

function parseUserLevel(raw) {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  return 1;
}

export async function fetchUserPublicProfile(userId) {
  const data = await fetchRpgJsonAuth(`/api/users/${encodeURIComponent(userId)}`);
  const u = extractUserObjectFromUsersResponse(data);
  if (!u || typeof u !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (u);
  const pet = extractPetFromUsersResponse(data);
  const userLevel = parseUserLevel(o.level ?? o.user_level);
  return {
    userId: asString(o.id ?? o.userId ?? userId),
    nickname: asString(o.nickname ?? o.realName ?? '').trim(),
    avatar: asString(o.avatar ?? '🥚') || '🥚',
    intro: asString(o.intro ?? ''),
    university: asString(o.universityName ?? o.university_name ?? ''),
    major: asString(o.major ?? ''),
    schoolYear: asString(o.schoolYear ?? o.school_year ?? ''),
    age: o.age != null ? asString(o.age) : '',
    friendCode: o.friendCode != null ? asString(o.friendCode) : o.friend_code != null ? asString(o.friend_code) : '',
    pet,
    userLevel,
  };
}
