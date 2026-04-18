import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SETTINGS_KEYS, getMasterVolume, getBgmEnabled, getSfxEnabled } from '../utils/settingsStorage';
import './SettingsModal.css';

const SettingsModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [masterVolume, setMasterVolume] = useState(80);
  const [bgmOn, setBgmOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [notifOn, setNotifOn] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMasterVolume(getMasterVolume());
    setBgmOn(getBgmEnabled());
    setSfxOn(getSfxEnabled());
    setNotifOn(localStorage.getItem(SETTINGS_KEYS.notifications) === '1');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const saveMaster = (v) => {
    const n = Math.min(100, Math.max(0, Number(v)));
    setMasterVolume(n);
    localStorage.setItem(SETTINGS_KEYS.masterVolume, String(n));
  };

  const toggleBgm = () => {
    const next = !bgmOn;
    setBgmOn(next);
    localStorage.setItem(SETTINGS_KEYS.bgmEnabled, next ? '1' : '0');
  };

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    localStorage.setItem(SETTINGS_KEYS.sfxEnabled, next ? '1' : '0');
  };

  const toggleNotif = () => {
    const next = !notifOn;
    setNotifOn(next);
    localStorage.setItem(SETTINGS_KEYS.notifications, next ? '1' : '0');
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  if (!open) return null;

  return createPortal(
    <div className="settings-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-modal-header">
          <h2 id="settings-modal-title" className="settings-modal-title">
            ⚙️ 설정
          </h2>
          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          <section className="settings-section" aria-labelledby="settings-sound">
            <h3 id="settings-sound" className="settings-section-title">
              🔊 소리
            </h3>
            <div className="settings-row">
              <label className="settings-label" htmlFor="settings-master-vol">
                전체 볼륨
              </label>
              <div className="settings-volume-wrap">
                <input
                  id="settings-master-vol"
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => saveMaster(e.target.value)}
                  className="settings-range"
                />
                <span className="settings-volume-value">{masterVolume}%</span>
              </div>
            </div>
            <div className="settings-row settings-row-toggle">
              <span className="settings-label">배경음 (BGM)</span>
              <button
                type="button"
                role="switch"
                aria-checked={bgmOn}
                className={`settings-toggle ${bgmOn ? 'is-on' : ''}`}
                onClick={toggleBgm}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
            <div className="settings-row settings-row-toggle">
              <span className="settings-label">효과음 (SFX)</span>
              <button
                type="button"
                role="switch"
                aria-checked={sfxOn}
                className={`settings-toggle ${sfxOn ? 'is-on' : ''}`}
                onClick={toggleSfx}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
          </section>

          <section className="settings-section" aria-labelledby="settings-notif">
            <h3 id="settings-notif" className="settings-section-title">
              🔔 알림
            </h3>
            <div className="settings-row settings-row-toggle">
              <span className="settings-label">푸시 알림</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifOn}
                className={`settings-toggle ${notifOn ? 'is-on' : ''}`}
                onClick={toggleNotif}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
            <p className="settings-hint">앱 알림 권한은 브라우저·OS 설정과 함께 적용됩니다.</p>
          </section>

          <section className="settings-section settings-section-account" aria-labelledby="settings-account">
            <h3 id="settings-account" className="settings-section-title">
              👤 계정
            </h3>
            <button type="button" className="settings-logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
            <p className="settings-hint">로그아웃 시 시작 화면으로 돌아갑니다.</p>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
