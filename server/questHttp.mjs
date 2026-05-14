import { QuestRuntimeStore } from './questStore.mjs';
import { kstYmd } from './questEngine.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let singletonStore = null;

export function getQuestStore() {
  if (!singletonStore) {
    const raw = readFileSync(join(__dirname, 'quests.seed.json'), 'utf8');
    const templates = JSON.parse(raw);
    singletonStore = new QuestRuntimeStore(templates);
  }
  return singletonStore;
}

export function parseUserIdFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  if (token === 'dev-mock-token') return 1;
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const json = Buffer.from(parts[1], 'base64url').toString('utf8');
      const p = JSON.parse(json);
      const id = Number(p.userId ?? p.sub ?? p.id ?? p.user_id);
      if (Number.isFinite(id) && id > 0) return id;
    } catch {
      /* ignore */
    }
  }
  return 1;
}

/**
 * @param {{ method: string, pathname: string, rawBody?: string, authHeader?: string, searchParams?: URLSearchParams }} input
 * @returns {Promise<{ status: number, body: object, json: boolean }>}
 */
export async function handleQuestApiRequest({
  method,
  pathname,
  rawBody,
  authHeader,
  searchParams = new URLSearchParams(),
}) {
  const store = getQuestStore();
  const userId = parseUserIdFromAuthHeader(authHeader);
  if (!userId) {
    return { status: 401, json: true, body: { error: 'UNAUTHORIZED' } };
  }

  if (method === 'GET' && pathname === '/api/wallet') {
    const qUid = Number(searchParams.get('userId'));
    const walletUserId =
      Number.isFinite(qUid) && qUid >= 1 ? Math.floor(qUid) : userId;
    store.ensureUser(walletUserId);
    const u = store.users.get(walletUserId);
    return {
      status: 200,
      json: true,
      body: { coin: Number(u.coin) || 0 },
    };
  }

  if (method === 'GET' && pathname === '/api/me/quests/current') {
    return { status: 200, json: true, body: store.getCurrentPayload(userId) };
  }

  if (method === 'PATCH' && pathname === '/api/me/quests/daily') {
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return { status: 400, json: true, body: { error: 'INVALID_JSON' } };
    }
    const slot = Number(body.slot);
    const completed = Boolean(body.completed);
    try {
      const out = store.patchSlot(userId, 'daily', slot, completed);
      return { status: 200, json: true, body: out };
    } catch (e) {
      return { status: e.status || 500, json: true, body: { error: String(e.message || e) } };
    }
  }

  if (method === 'PATCH' && pathname === '/api/me/quests/weekly') {
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return { status: 400, json: true, body: { error: 'INVALID_JSON' } };
    }
    const slot = Number(body.slot);
    const completed = Boolean(body.completed);
    try {
      const out = store.patchSlot(userId, 'weekly', slot, completed);
      return { status: 200, json: true, body: out };
    } catch (e) {
      return { status: e.status || 500, json: true, body: { error: String(e.message || e) } };
    }
  }

  /** 참조 백엔드(`server/reference-backend.mjs`) 등 Node에서 직접 호출할 때. 브라우저는 실제 GET /api/me + 퀘스트 페이로드 병합. */
  if (method === 'GET' && pathname === '/api/me') {
    store.ensureUser(userId);
    const u = store.users.get(userId);
    const s = u.stats || {};
    return {
      status: 200,
      json: true,
      body: {
        user: {
          id: userId,
          nickname: '퀘스트테스트',
          level: u.level ?? 1,
          exp: u.exp ?? 0,
          coin: Number(u.coin) || 0,
          stats: {
            health: Number(s.health) || 0,
            diligence: Number(s.diligence) || 0,
            focus: Number(s.focus) || 0,
            social: Number(s.social) || 0,
            creativity: Number(s.creativity) || 0,
            dailyFatigue: Number(s.dailyFatigue) || 0,
            lastUpdatedDate: s.lastUpdatedDate ?? kstYmd(),
          },
          universityName: '',
          major: '',
          schoolYear: 1,
          age: 20,
        },
        pet: u.pet
          ? {
              id: 1,
              name: u.pet.name ?? '부화중인 알',
              level: u.pet.level ?? 1,
              evolutionStage: u.pet.evolutionStage ?? 0,
              animalType: u.pet.animalType ?? 'egg',
              lineageType: u.pet.lineageType ?? null,
              lastEvolvedAt: u.pet.lastEvolvedAt ?? null,
            }
          : null,
      },
    };
  }

  if (method === 'POST' && pathname === '/api/me/todo-completion-reward') {
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return { status: 400, json: true, body: { error: 'INVALID_JSON' } };
    }
    const dateKey = typeof body.dateKey === 'string' ? body.dateKey : '';
    const clientTodoId = body.clientTodoId;
    try {
      const out = store.claimTodoCompletionBonus(userId, dateKey, clientTodoId);
      return { status: 200, json: true, body: out };
    } catch (e) {
      const code = e?.code;
      if (e?.status === 400 && code === 'NOT_TODAY') {
        return {
          status: 400,
          json: true,
          body: { code: 'NOT_TODAY', error: String(e.message || e) },
        };
      }
      if (e?.status === 400) {
        return { status: 400, json: true, body: { error: String(e.message || e) } };
      }
      return { status: 500, json: true, body: { error: String(e?.message || e) } };
    }
  }

  return { status: 404, json: true, body: { error: 'NOT_FOUND' } };
}
