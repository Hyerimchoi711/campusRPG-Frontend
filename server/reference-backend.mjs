#!/usr/bin/env node
/**
 * 로컬 참조용 메인 백엔드 (퀘스트 롤 + /api/me 일부).
 * 사용: node server/reference-backend.mjs
 * 기본 포트 8889 — VITE_DEV_BACKEND_URL=http://127.0.0.1:8889 npm run dev
 */
import http from 'node:http';
import { handleQuestApiRequest } from './questHttp.mjs';

const PORT = Number(process.env.PORT || process.env.QUEST_REF_BACKEND_PORT || 8889);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const rawBody = method === 'PATCH' || method === 'POST' ? await readBody(req) : '';
    const out = await handleQuestApiRequest({
      method,
      pathname,
      rawBody,
      authHeader: req.headers.authorization,
    });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(out.status);
    res.end(JSON.stringify(out.body));
  } catch (e) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(500);
    res.end(JSON.stringify({ error: String(e?.message || e) }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[reference-backend] http://127.0.0.1:${PORT}  (GET /api/me/quests/current, PATCH daily|weekly, GET /api/me)`);
});
