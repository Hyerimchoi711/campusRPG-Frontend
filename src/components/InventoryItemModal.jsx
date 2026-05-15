import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/InventoryItemModal.css';

function ModalIcon({ imageUrl, iconEmoji }) {
  const [imgBroken, setImgBroken] = useState(false);
  if (imageUrl && !imgBroken) {
    return (
      <img
        className="inv-item-modal-icon-img"
        src={imageUrl}
        alt=""
        width={56}
        height={56}
        decoding="async"
        onError={() => setImgBroken(true)}
      />
    );
  }
  return <span className="inv-item-modal-icon-emoji">{iconEmoji || '❔'}</span>;
}

/**
 * @param {{
 *   open: boolean,
 *   item: object|null,
 *   using: boolean,
 *   onClose: () => void,
 *   onUse: () => void,
 * }} props
 */
export default function InventoryItemModal({ open, item, using, onClose, onUse }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !using) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, using, onClose]);

  if (!open || !item) return null;

  return createPortal(
    <div
      className="inv-item-modal-backdrop"
      role="presentation"
      onClick={using ? undefined : onClose}
    >
      <div
        className="inv-item-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inv-item-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inv-item-modal-header">
          <h2 id="inv-item-modal-title" className="inv-item-modal-title">
            아이템 정보
          </h2>
          <button
            type="button"
            className="inv-item-modal-close"
            onClick={onClose}
            disabled={using}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="inv-item-modal-body">
          <div className="inv-item-modal-icon-wrap">
            <ModalIcon imageUrl={item.imageUrl} iconEmoji={item.iconEmoji} />
          </div>
          <p className="inv-item-modal-name">{item.name}</p>
          {item.description ? <p className="inv-item-modal-desc">{item.description}</p> : null}
          <p className="inv-item-modal-qty">보유: ×{item.quantity}</p>
        </div>

        <div className="inv-item-modal-actions">
          <button
            type="button"
            className="inv-item-modal-btn inv-item-modal-btn--primary"
            onClick={onUse}
            disabled={using || item.quantity < 1}
          >
            {using ? '사용 중…' : '사용하기'}
          </button>
          <button
            type="button"
            className="inv-item-modal-btn inv-item-modal-btn--ghost"
            onClick={onClose}
            disabled={using}
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
