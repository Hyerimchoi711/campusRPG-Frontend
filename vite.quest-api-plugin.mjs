import { handleQuestApiRequest } from './server/questHttp.mjs';

/**
 * 개발 서버에서 /api/me/quests 및 (선택) 목 /api/me 를 인메모리로 처리합니다.
 * 비활성: VITE_EMBEDDED_QUEST_STUB=false
 */
export function questDevApiPlugin() {
  return {
    name: 'quest-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const enabled = process.env.VITE_EMBEDDED_QUEST_STUB !== 'false';
        if (!enabled) return next();

        const url = (req.originalUrl || req.url || '').split('?')[0];
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

        const readBody = () =>
          new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            req.on('error', reject);
          });

        try {
          const rawBody =
            req.method === 'PATCH' || req.method === 'POST' ? await readBody() : '';
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
