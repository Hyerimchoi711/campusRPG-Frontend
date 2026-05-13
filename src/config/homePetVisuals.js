import homeForestBg from '../assets/images/home-forest-nest.png';

/** 기본 숲 배경. 종별 전용 배경 에셋이 생기면 여기에 매핑 추가 */
const BG_BY_ANIMAL_TYPE = {
  egg: homeForestBg,
  파이루: homeForestBg, 
  파이로소어: homeForestBg,
  워티: homeForestBg,
  워터북: homeForestBg,
  스푸티: homeForestBg,
  스프라우트랫: homeForestBg,
  클루: homeForestBg,
  '클라우드 윙': homeForestBg,
  라니: homeForestBg,
  '라이트닝 혼': homeForestBg,
};

/**
 * @param {object|null|undefined} pet — /api/me 의 pet
 */
export function getHomeBackgroundUrlForPet(pet) {
  const t = pet?.animalType;
  if (!t || t === 'egg') return homeForestBg;
  return BG_BY_ANIMAL_TYPE[t] || homeForestBg;
}
