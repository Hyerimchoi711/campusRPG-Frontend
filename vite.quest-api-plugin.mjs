import { handleQuestApiRequest } from './server/questHttp.mjs';

/**
 * 개발 서버: /api/me/quests/* 인메모리 스텁(런타임 off 가능) + /__dev/quest-stub 제어.
 * GET /api/me는 가로채지 않음. `embeddedQuestStub`은 vite.config에서 `loadEnv` 결과로 넘김.
 *
 * @param {{ embeddedQuestStub?: boolean }} [options] — false면 스텁 미가로채기(envLocked)
 */
export function questDevApiPlugin(options = {}) {
  const ENV_STUB_ENABLED = options.embeddedQuestStub !== false;
  let questStubRuntimeEnabled = ENV_STUB_ENABLED;

  return {
    name: 'quest-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.originalUrl || req.url || '').split('?')[0];

        const readBodyOnce = () =>
          new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            req.on('error', reject);
          });

        if (url === '/__dev/quest-stub' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              enabled: ENV_STUB_ENABLED && questStubRuntimeEnabled,
              envLocked: !ENV_STUB_ENABLED,
            })
          );
          return;
        }

        if (url === '/__dev/quest-stub' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          if (!ENV_STUB_ENABLED) {
            res.statusCode = 200;
            res.end(JSON.stringify({ enabled: false, envLocked: true }));
            return;
          }
          let body = {};
          try {
            const raw = await readBodyOnce();
            body = raw ? JSON.parse(raw) : {};
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'INVALID_JSON' }));
            return;
          }
          if (typeof body.enabled === 'boolean') {
            questStubRuntimeEnabled = body.enabled;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ enabled: questStubRuntimeEnabled, envLocked: false }));
          return;
        }

        if (!ENV_STUB_ENABLED) return next();

        if (!questStubRuntimeEnabled) return next();

        if (
          url !== '/api/me/quests/current' &&
          url !== '/api/me/quests/daily' &&
          url !== '/api/me/quests/weekly'
        ) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const rawBody =
            req.method === 'PATCH' || req.method === 'POST' ? await readBodyOnce() : '';
          const out = await handleQuestApiRequest({
            method: req.method || 'GET',
            pathname: url,
            rawBody,
            authHeader: req.headers.authorization,
          });
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = out.status;
          res.end(JSON.stringify(out.body));
        } catch (e) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e?.message || e) }));
        }
      });
    },
  };
}
