export const AVATAR_ASSET_V = '20260511';

export const AVATAR_IMAGE_URLS = [
  `/images/avatars/clou.png?v=${AVATAR_ASSET_V}`,
  `/images/avatars/lani.png?v=${AVATAR_ASSET_V}`,
  `/images/avatars/sputti.png?v=${AVATAR_ASSET_V}`,
  `/images/avatars/waterboogi.png?v=${AVATAR_ASSET_V}`,
  `/images/avatars/pyro.png?v=${AVATAR_ASSET_V}`,
];

/** 신규·초기화 시 기본 프로필 아이콘 */
export const DEFAULT_AVATAR = AVATAR_IMAGE_URLS[0];

const AVATAR_EMOJI_EXTRA = ['🥚', '🧑‍🎓', '👩‍🎓', '🦉', '📚', '🌱', '⭐', '🎮'];

/** 프로필 사진 변경 모달에 나열할 전체 옵션 */
export const AVATAR_OPTIONS = [...AVATAR_IMAGE_URLS, ...AVATAR_EMOJI_EXTRA];
