# Campus Life RPG — Frontend

React(Vite) 클라이언트입니다. API는 별도 백엔드 레포에서 실행합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저는 보통 `http://localhost:5173` 입니다. 로컬에서 API를 쓰려면 백엔드(기본 5555)와, 퀘스트 LLM을 쓰려면 `server`(기본 8787)를 띄운 뒤 `vite.config.js` 프록시 설정을 맞춥니다.

## 환경 변수

- 배포 시 프론트와 API 도메인이 다르면 `.env.example`을 참고해 `VITE_API_BASE_URL` 등을 설정한 뒤 `npm run build` 합니다.
- 로컬 개발에서는 변수 없이 상대 경로 `/api` + Vite 프록시로 동작합니다.

## 빌드

```bash
npm run build
```

산출물은 `dist/` 입니다.
