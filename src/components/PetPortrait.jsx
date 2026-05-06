import React, { useState } from 'react';
import { getPetEmoji, getPetPortraitSrc } from '../models/pet';

/**
 * public/images/animals/{slug}.png 우선, 없거나 로드 실패 시 이모지 폴백
 */
export default function PetPortrait({ animalType, alt = '', imgClassName = '', emojiClassName = '' }) {
  const [broken, setBroken] = useState(false);
  const src = getPetPortraitSrc(animalType);
  const emoji = getPetEmoji(animalType);

  if (broken) {
    return (
      <span className={emojiClassName} role="img" aria-label={alt || '펫'}>
        {emoji}
      </span>
    );
  }

  return (
    <img src={src} alt={alt} className={imgClassName} decoding="async" onError={() => setBroken(true)} />
  );
}
