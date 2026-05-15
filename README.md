# Campus Life RPG — Frontend

React(Vite) 클라이언트입니다. API는 별도 백엔드 레포에서 실행합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저는 보통 `http://localhost:5173` 입니다. 로컬에서 API를 쓰려면 메인 백엔드(기본 `http://127.0.0.1:8888`, `VITE_DEV_BACKEND_URL`)를 띄운 뒤 `npm run dev`로 Vite 프록시를 사용합니다. 맞춤 퀘스트 생성(`POST /api/quests/generate`)도 동일 백엔드로 프록시됩니다.

## 환경 변수

- 배포 시 프론트와 API 도메인이 다르면 `.env.example`을 참고해 `VITE_API_BASE_URL` 등을 설정한 뒤 `npm run build` 합니다.
- 로컬 개발에서는 변수 없이 상대 경로 `/api` + Vite 프록시로 동작합니다.

## 빌드

```bash
npm run build
```

산출물은 `dist/` 입니다.
