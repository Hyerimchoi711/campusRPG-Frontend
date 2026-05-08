/**
 * 개발·테스트용 단일 플레이스홀더 (런타임 친구 목록은 API만 사용).
 * 프로필·친구 화면은 `/api/users/:id` 등으로 조회합니다.
 */
export const MOCK_FRIENDS = [
  {
    id: 'demo-1',
    realName: '데모 친구',
    university: '한국대학교',
    major: '컴퓨터공학과',
    schoolYear: '3',
    age: '22',
    intro: '서버 연동 전 로컬 참고용 한 줄입니다.',
    avatar: '🧑‍🎓',
    online: true,
  },
];
