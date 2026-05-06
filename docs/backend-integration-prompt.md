# 통합 백엔드 작업 프롬프트 (학년 + 친구 DB/API)

아래 요구사항을 한 번에 구현할 수 있도록 정리했습니다. 모든 보호 경로는 **Bearer JWT**(`Authorization: Bearer <token>`) 필수입니다. 프론트엔드는 동일 헤더로 호출합니다.

## 1. 회원가입 학년

- `POST /api/auth/register` 본문에 **`school_year`** (정수 1~6)를 수용하고 DB에 저장합니다.
- `GET /api/me`의 `user`에 **`schoolYear`**(camel 권장) 또는 **`school_year`**를 반환합니다. (프론트는 둘 다 파싱합니다.)

## 2. 사용자 친구 코드

- 각 사용자마다 고유 **`friend_code`**(DB 유니크 인덱스). 가입 시 자동 생성하거나 마이그레이션으로 기존 사용자에 채웁니다.
- `GET /api/me` → `user.friendCode`(camel 권장)로 노출합니다.

## 3. DB 테이블 (예시 — 구현 시 조정 가능)

- **`friendships`** (또는 `user_friends`): `id`, `user_id`, `friend_user_id`, `sort_order`, `created_at`, 유니크 `(user_id, friend_user_id)`. 양방향 친구면 행 2개 또는 정규화 정책 중 하나를 선택합니다.
- **`friend_requests`**: `id`, `from_user_id`, `to_user_id`, `status` (`pending` | `accepted` | `rejected`), `created_at`. pending에 대해 `(from_user_id, to_user_id)` 유니크 등 중복 방지 규칙을 둡니다.

## 4. REST API 목록 (프론트 연동 기준)

| 메서드 | 경로 | 설명 |
| ------ | ---- | ---- |
| GET | `/api/me` | 기존 필드 + `schoolYear`/`school_year`, `friendCode`, (선택) `avatar`, `intro` 등 프로필 필드 동기화 |
| GET | `/api/friends` | 로그인 사용자의 친구 목록. 각 항목에 `sortOrder`, 표시용 `nickname`, `avatar`, `intro`, 친구 식별자(`userId` 또는 `friendUserId`) |
| PATCH | `/api/friends/order` | 본문 `{ "orderedUserIds": string[] }` — 표시 순서 저장 (문자열 ID 배열) |
| DELETE | `/api/friends/:friendUserId` | 친구 관계 삭제 |
| POST | `/api/friends/requests` | 본문 `{ "friendCode": "<코드>" }` — 상대에게 pending 요청 생성 |
| GET | `/api/friends/requests/incoming` | 받은 pending 요청 목록 + 요청자 `nickname`, `intro`, `avatar`, 요청 `id` |
| POST | `/api/friends/requests/:id/accept` | 수락 시 friendship 생성 (양쪽 정책은 서버에서 확정) |
| POST | `/api/friends/requests/:id/reject` | 거절 |
| GET | `/api/users/:userId` | 공개 프로필 + 가능하면 `friendCode` (친구 관계일 때만 노출 등 정책은 서버 결정). 응답은 `{ user: { ... } }` 또는 동등한 단일 객체 형태 모두 파싱 가능하면 유연하게 |

## 5. 에러·정책

- 잘못된 코드, 자기 자신, 이미 친구, 중복 요청 등은 **4xx**와 명확한 `message`(또는 `error`) 본문을 반환합니다.
- 친구 목록/요청/유저 조회 응답에 **닉네임**, **한줄 소개**, **아바타(이모지 문자열)** 필드명을 문서화해 일관되게 맞춥니다 (`nickname`, `intro`, `avatar` 등).

---

## 6. 프론트엔드 구현 요약 (백엔드·연동 참고)

아래는 **현재 레포에 반영된 프론트 동작**입니다. 스펙을 맞출 때 이 표와 파싱 규칙을 기준으로 삼으면 됩니다.

### 6.1 변경·추가된 주요 파일

| 경로 | 역할 |
| --- | --- |
| `src/api/rpgClient.js` | `fetchRpgJsonAuth`: 모든 보호 API에 `Authorization: Bearer <JWT>` 병합. 실패 시 `Error.message` ← 응답 JSON의 `message` 또는 `error` 우선. |
| `src/api/friendsClient.js` | 친구 목록·받은 요청·코드로 요청·수락/거절·삭제·순서 PATCH·`GET /api/users/:id` 래퍼 및 필드 정규화. |
| `src/pages/FriendsPage.jsx` | API만으로 목록 표시, 요청 배지(incoming 개수), 추가/요청 모달, 관리 모드(선택 삭제·위/아래 순서 저장). |
| `src/styles/FriendsPage.css` | 모달·토스트·관리 모드·카드 행 스타일. |
| `src/pages/ProfilePage.jsx` | 내 프로필: `/api/me` 기반 + **친구 코드** 표시·복사. 친구 프로필: `fetchUserPublicProfile`로 로딩/에러 처리. |
| `src/styles/ProfilePage.css` | 친구 코드 블록·친구 프로필 로딩 문구. |
| `src/data/mockFriends.js` | **런타임 목록 미사용**. 단일 플레이스홀더 1건만 유지(참고용). |
| `vite.config.js` | `/api/friends`, `/api/users` → 메인 백엔드로 명시 프록시 (그 외 `/api`는 퀘스트 서버로 가므로 경로 분리 중요). |

### 6.2 인증 헤더

- 키: `localStorage`의 `TOKEN_KEY` (`src/constants/authStorage.js`와 동일).
- 형식: `Authorization: Bearer <JWT>`.
- 토큰이 없으면 헤더를 붙이지 않습니다 → 백엔드는 401 처리하면 됩니다.

### 6.3 개발 서버 프록시 (`vite.config.js`)

- 환경 변수 `VITE_DEV_BACKEND_URL`(미설정 시 기본 `http://127.0.0.1:8888`)으로 다음이 프록시됩니다.  
  **`/api/auth`**, **`/api/me`**, **`/api/friends`**, **`/api/users`**, 및 기타 기존 백엔드 경로.
- **`/api/friends`·`/api/users`가 마지막 catch-all `/api`보다 위에 있어야** 퀘스트 서버로 잘못 가지 않습니다.

### 6.4 프론트가 보내는 요청 본문·메서드

| API | 프론트 동작 |
| --- | --- |
| `POST /api/friends/requests` | `{"friendCode":"<문자열>"}` (`camelCase`) |
| `POST .../accept`, `POST .../reject` | 본문 `{}` (빈 JSON) |
| `PATCH /api/friends/order` | `{"orderedUserIds":["id1","id2",...]}` — **문자열 ID 배열**(숫자만 쓰는 백엔드도 JSON 숫자/문자 혼용 시 문자열로 직렬화됨) |
| `DELETE /api/friends/:friendUserId` | 본문 없음 |

### 6.5 프론트가 받아들이는 응답 형태 (유연 파싱)

**`GET /api/friends`**

- 최상위가 배열이거나, 객체인 경우 `friends` 또는 `items` 배열을 사용합니다.
- 각 친구 행에서 사용자 ID: `userId` · `friendUserId` · `id` · `user_id` · `friend_user_id` 중 하나.
- 정렬 값: `sortOrder` 또는 `sort_order`.
- 표시명: `nickname` · `realName` · `name`.

**`GET /api/friends/requests/incoming`**

- 배열 또는 `requests` 배열.
- 요청 ID: `id` 또는 `requestId`.
- 요청자 ID(선택): `fromUserId` 또는 `from_user_id`.
- 닉네임: `nickname` 또는 `fromNickname`.

**`GET /api/users/:userId`**

- 루트가 사용자 객체이거나, `{ "user": { ... } }` 형태 모두 허용.
- 프로필 필드: `nickname`·`realName`, `avatar`, `intro`, `universityName`·`university_name`, `major`, `schoolYear`·`school_year`, `age`, `friendCode`·`friend_code`.
- 사용자 ID: `id` 또는 `userId`.

### 6.6 화면·라우팅 동작

- 친구 카드 클릭 시 `react-router` 경로: **`/profile/friend/:userId`** — 여기 `:userId`는 **백엔드 사용자 ID와 동일한 문자열**이어야 합니다.
- 받은 친구 요청 탭 배지 숫자 = **`GET .../incoming` 배열 길이**(고정값 없음).
- 친구 코드 UI: 내 프로필은 **`GET /api/me`의 `user.friendCode` 또는 `user.friend_code`**; 친구 프로필은 **`GET /api/users/:id` 응답에 코드가 있을 때만** 표시(백엔드 정책에 따름).

### 6.7 회원가입 학년 필드 (프론트 실제 값)

- `POST /api/auth/register` 본문에 **`school_year`** 키로 **정수**를 보냅니다 (`src/pages/SignupPage.jsx`).
- 현재 입력 검증은 UI 상 **1~4학년**만 허용합니다. 백엔드에서 1~6을 요구하면 프론트 검증 범위를 나중에 맞추면 됩니다.

### 6.8 에러 메시지 표시

- 인증 fetch 실패 시 사용자에게 보이는 문구는 가능하면 응답 JSON의 **`message`** 또는 **`error`** 필드를 사용합니다. 통일된 키를 쓰면 디버깅이 쉽습니다.
