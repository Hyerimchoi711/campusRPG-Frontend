import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLevelUp } from '../context/LevelUpContext';
import '../styles/LevelUpModal.css';

function getPhoneScreenEl() {
  return typeof document !== 'undefined' ? document.getElementById('phoneScreen') : null;
}

export default function LevelUpModal() {
  const { open, closeLevelUp, prevLevel, newLevel, petEmoji, rewards } = useLevelUp();
  const container = open ? getPhoneScreenEl() : null;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLevelUp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeLevelUp]);

  if (!open || !container) return null;

  return createPortal(
    <div className="levelup-modal" role="dialog" aria-modal="true" aria-labelledby="levelup-modal-title">
      <button
        type="button"
        className="levelup-modal__backdrop"
        aria-label="닫기"
        onClick={closeLevelUp}
      />
      <div className="levelup-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="levelup-modal__ribbon" aria-hidden>
          <span className="levelup-modal__ribbon-inner">★</span>
        </div>

        <h2 id="levelup-modal-title" className="levelup-modal__title">
          레벨 업!
        </h2>

        <p className="levelup-modal__sub">동료와 함께 한 걸음 성장했어요</p>

        <div className="levelup-modal__lvl-row">
          <span className="levelup-modal__lvl-pill">
            Lv.<span className="levelup-modal__lvl-num">{prevLevel}</span>
          </span>
          <span className="levelup-modal__arrow" aria-hidden>
            →
          </span>
          <span className="levelup-modal__lvl-pill levelup-modal__lvl-pill--next">
            Lv.<span className="levelup-modal__lvl-num">{newLevel}</span>
          </span>
        </div>

        <div className="levelup-modal__mascot" aria-hidden>
          <span className="levelup-modal__spark">✨</span>
          <span className="levelup-modal__emoji">{petEmoji || '🥚'}</span>
          <span className="levelup-modal__spark">✨</span>
        </div>

        <div className="levelup-modal__rewards">
          <span className="levelup-modal__rewards-label">획득</span>
          <ul className="levelup-modal__reward-list">
            {rewards.map((r, i) => (
              <li key={`${r.text}-${i}`} className="levelup-modal__reward-chip">
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="levelup-modal__btn" onClick={closeLevelUp}>
          계속하기
        </button>
      </div>
    </div>,
    container
  );
}
