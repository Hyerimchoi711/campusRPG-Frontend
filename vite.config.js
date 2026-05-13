import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { questDevApiPlugin } from './vite.quest-api-plugin.mjs'

// 개발 시: Vite(예: 5173)만 브라우저에 쓰고, 아래 경로는 프록시됩니다.
// - /api/quests → LLM 퀘스트 서버(VITE_DEV_QUEST_API_URL, 기본 8787)
// - /api/auth, /api/me, … → 메인 백엔드(VITE_DEV_BACKEND_URL, 미설정 시 기본 8888)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_DEV_BACKEND_URL || 'http://127.0.0.1:8888'
  const questTarget =
    env.VITE_DEV_QUEST_API_URL || 'http://127.0.0.1:8787'

  return {
    plugins: [react(), questDevApiPlugin()],
    server: {
      proxy: {
        '/api/quests': {
          target: questTarget,
          changeOrigin: true,
        },
        '/api/me/quests': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/auth': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/me': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/health': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/wallet': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/items': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/inventory': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/friends': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/users': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/announcements': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api/events': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api': {
          target: questTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
