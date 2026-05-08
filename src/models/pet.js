/**
 * /api/me 의 pet 객체와 화면 표시용 헬퍼.
 * 백엔드는 snake_case를 쓸 수 있어 normalize 시 둘 다 수용합니다.
 */

/** @typedef {Object} GameUserPet
 * @property {number|null} [id]
 * @property {string} [name]
 * @property {number} [level]
 * @property {number} [evolutionStage]
 * @property {string} [animalType]
 * @property {string|null} [lineageType]
 * @property {string|null} [lastEvolvedAt]
 */

export const DEFAULT_EGG_PET_NAME = '부화중인 알';

/** 동물 타입 키 (백엔드 animal_type / animalType 문자열과 동일하게 매칭) */
export const PET_ANIMAL_TYPES = [
  'egg',
  '파이루',
  '파이로소어',
  '워티',
  '워터북',
  '스푸티',
  '스프라우트랫',
  '클루',
  '클라우드 윙',
  '라니',
  '라이트닝 혼',
];

const SLUG_BY_TYPE = {
  egg: 'egg',
  파이루: 'pairu',
  파이로소어: 'pairosaur',
  워티: 'woti',
  워터북: 'waterbook',
  스푸티: 'sputi',
  스프라우트랫: 'sproutrat',
  클루: 'clue',
  '클라우드 윙': 'cloudwing',
  라니: 'rani',
  '라이트닝 혼': 'lightninghorn',
};

const EMOJI_BY_TYPE = {
  egg: '🥚',
  파이루: '🔥',
  파이로소어: '🦎',
  워티: '💧',
  워터북: '📘',
  스푸티: '🌿',
  스프라우트랫: '🐀',
  클루: '☁️',
  '클라우드 윙': '🕊️',
  라니: '⚡',
  '라이트닝 혼': '🦄',
};

/** 짧은 도감 설명 (UI용) */
const DESC_BY_TYPE = {
  egg: '아직 알 속에서 성장 중이에요.',
  파이루: '건강 스탯이 이끈 불꽃 계열의 유아기 동료예요.',
  파이로소어: '파이루가 성장한 진화형이에요. 건강 계보를 이어 가요.',
  워티: '성실 스탯이 이끈 물결 계열의 유아기 동료예요.',
  워터북: '워티가 성장한 진화형이에요. 성실 계보를 이어 가요.',
  스푸티: '집중 스탯이 이끈 새싹 계열의 유아기 동료예요.',
  스프라우트랫: '스푸티가 성장한 진화형이에요. 집중 계보를 이어 가요.',
  클루: '사교 스탯이 이끈 바람 계열의 유아기 동료예요.',
  '클라우드 윙': '클루가 성장한 진화형이에요. 사교 계보를 이어 가요.',
  라니: '창의 스탯이 이끈 번개 계열의 유아기 동료예요.',
  '라이트닝 혼': '라니가 성장한 진화형이에요. 창의 계보를 이어 가요.',
};

function trimOrEmpty(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * API에서 내려온 animal_type / animalType 문자열을 표준 키로 맞춥니다.
 * @param {string|null|undefined} raw
 * @returns {string}
 */
export function normalizeAnimalTypeKey(raw) {
  const s = trimOrEmpty(raw);
  if (!s || s.toLowerCase() === 'egg') return 'egg';
  if (SLUG_BY_TYPE[s]) return s;
  const lower = s.toLowerCase();
  const bySlug = Object.entries(SLUG_BY_TYPE).find(([, slug]) => slug === lower);
  if (bySlug) return bySlug[0];
  return s;
}

/**
 * @param {unknown} raw
 * @returns {GameUserPet|null}
 */
export function normalizePet(raw) {
  if (raw == null || typeof raw !== 'object') return null;

  const o = /** @type {Record<string, unknown>} */ (raw);
  const evolutionStage = Number(o.evolutionStage ?? o.evolution_stage);
  const levelNum = Number(o.level);

  const lineageRaw = o.lineageType ?? o.lineage_type;
  const lastEvolvedRaw = o.lastEvolvedAt ?? o.last_evolved_at;

  const animalRaw = o.animalType ?? o.animal_type;
  const animalType = normalizeAnimalTypeKey(
    animalRaw == null || animalRaw === '' ? 'egg' : String(animalRaw)
  );

  const nameTrim = trimOrEmpty(o.name);
  const name =
    nameTrim ||
    (animalType === 'egg'
      ? DEFAULT_EGG_PET_NAME
      : animalType in SLUG_BY_TYPE
        ? animalType
        : animalType || '동료');

  return {
    id: o.id != null ? Number(o.id) : null,
    name,
    level: Number.isFinite(levelNum) && levelNum >= 0 ? Math.floor(levelNum) : 1,
    evolutionStage: Number.isFinite(evolutionStage) ? evolutionStage : 0,
    animalType,
    lineageType:
      lineageRaw == null || lineageRaw === ''
        ? null
        : String(lineageRaw),
    lastEvolvedAt:
      lastEvolvedRaw == null || lastEvolvedRaw === ''
        ? null
        : String(lastEvolvedRaw),
  };
}

/**
 * @param {GameUserPet|null|undefined} pet
 */
export function isPetEgg(pet) {
  if (!pet) return true;
  return pet.animalType === 'egg';
}

/** @param {string|null|undefined} animalType */
export function isEggAnimalType(animalType) {
  return normalizeAnimalTypeKey(animalType) === 'egg';
}

/**
 * 프로필 등에서 animalType 문자열이 없을 때 petStage 로 보조 판단
 * @param {string|null|undefined} animalType
 * @param {string|undefined} petStage egg | hatched
 */
export function isPetEggUi(animalType, petStage) {
  const raw = trimOrEmpty(animalType);
  if (raw !== '') {
    return normalizeAnimalTypeKey(raw) === 'egg';
  }
  return petStage === 'egg';
}

/**
 * @param {string|null|undefined} animalType
 */
export function getPetPortraitSlug(animalType) {
  const key = normalizeAnimalTypeKey(animalType);
  return SLUG_BY_TYPE[key] || 'egg';
}

/**
 * @param {string|null|undefined} animalType
 */
export function getPetPortraitSrc(animalType) {
  const slug = getPetPortraitSlug(animalType);
  return `/images/animals/${slug}.png`;
}

/**
 * @param {string|null|undefined} animalType
 */
export function getPetEmoji(animalType) {
  const key = normalizeAnimalTypeKey(animalType);
  return EMOJI_BY_TYPE[key] || '🐾';
}

/**
 * @param {string|null|undefined} animalType
 */
export function getPetSpeciesLabel(animalType) {
  const key = normalizeAnimalTypeKey(animalType);
  if (key === 'egg') return '부화중인 알';
  return key in SLUG_BY_TYPE ? key : key || '동료';
}

/**
 * @param {string|null|undefined} animalType
 */
export function getPetSpeciesDescription(animalType) {
  const key = normalizeAnimalTypeKey(animalType);
  return DESC_BY_TYPE[key] || '함께 성장하는 캠퍼스 동료예요.';
}

/**
 * @param {string|null|undefined} iso
 * @returns {string|null}
 */
export function formatLastEvolvedAt(iso) {
  if (!iso || typeof iso !== 'string') return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

/**
 * 부화 후 계보 뱃지용 — API lineageType 그대로 우선
 * @param {string|null|undefined} lineageType
 */
export function getLineageBadgeText(lineageType) {
  if (lineageType == null || trimOrEmpty(lineageType) === '') return null;
  return String(lineageType).trim();
}
