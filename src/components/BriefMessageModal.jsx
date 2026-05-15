import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/BriefMessageModal.css';

const DEFAULT_DURATION_MS = 1000;

/**
 * 짧게 뜨고 자동으로 사라지는 안내 모달
 * @param {{
 *   message: string|null,
 *   variant?: 'success' | 'error',
 *   durationMs?: number,
 *   onClose: () => void,
 * }} props
 */
export default function BriefMessageModal({
  message,
  variant = 'success',
  durationMs = DEFAULT_DURATION_MS,
  onClose,
}) {
  useEffect(() => {
    if (!message) return undefined;
    const t = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(t);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return createPortal(
    <div className="brief-msg-modal" role="presentation">
      <div className="brief-msg-modal__backdrop" aria-hidden="true" />
      <div
        className={`brief-msg-modal__panel brief-msg-modal__panel--${variant}`}
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live="polite"
      >
        <p className="brief-msg-modal__text">{message}</p>
      </div>
    </div>,
    document.body
  );
}
