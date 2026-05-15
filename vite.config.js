import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { questDevApiPlugin } from './vite.quest-api-plugin.mjs'

// 개발 시: Vite(예: 5173)만 브라우저에 쓰고, 아래 경로는 메인 백엔드로 프록시됩니다.
// - /api/quests/generate 포함 전체 /api → VITE_DEV_BACKEND_URL (기본 8888)
// - /api/me/quests* → VITE_EMBEDDED_QUEST_STUB=false 이면 백엔드만. 기본은 Vite 플러그인 스텁 ON
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_DEV_BACKEND_URL || 'http://127.0.0.1:8888'

  return {
    plugins: [
      react(),
      questDevApiPlugin({
        embeddedQuestStub: env.VITE_EMBEDDED_QUEST_STUB !== 'false',
      }),
    ],
    server: {
      proxy: {
        '/api/quests': {
          target: backendTarget,
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
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
