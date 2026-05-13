import { QuestRuntimeStore } from './questStore.mjs';
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
 * @returns {Promise<{ status: number, body: object, json: boolean }>}
 */
export async function handleQuestApiRequest({ method, pathname, rawBody, authHeader }) {
  const store = getQuestStore();
  const userId = parseUserIdFromAuthHeader(authHeader);
  if (!userId) {
    return { status: 401, json: true, body: { error: 'UNAUTHORIZED' } };
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

  if (method === 'GET' && pathname === '/api/me') {
    store.ensureUser(userId);
    const u = store.users.get(userId);
    return {
      status: 200,
      json: true,
      body: {
        user: {
          id: userId,
          nickname: '퀘스트테스트',
          exp: u.exp,
          stats: { ...u.stats },
          universityName: '',
          major: '',
          schoolYear: 1,
          age: 20,
        },
        pet: null,
      },
    };
  }

  return { status: 404, json: true, body: { error: 'NOT_FOUND' } };
}
