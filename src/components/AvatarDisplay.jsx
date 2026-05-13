import React from 'react';
import './AvatarDisplay.css';

const IMG_RE = /\.(png|webp|jpe?g|gif)(\?.*)?$/i;

export function isAvatarImageSrc(avatar) {
  if (typeof avatar !== 'string') return false;
  const s = avatar.trim();
  if (!s) return false;
  return (s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://')) && IMG_RE.test(s);
}

/**
 * 프로필 아이콘: 이모지 문자열 또는 `/images/...` 같은 이미지 URL.
 */
export default function AvatarDisplay({ value, className, imgClassName }) {
  const v = value != null && String(value).trim() !== '' ? String(value).trim() : '🥚';
  if (isAvatarImageSrc(v)) {
    const icn = ['avatar-display-img', imgClassName].filter(Boolean).join(' ');
    return <img src={v} alt="" className={icn} decoding="async" draggable={false} />;
  }
  return (
    <span className={className} aria-hidden>
      {v}
    </span>
  );
}
