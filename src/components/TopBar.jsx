import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useGameUser } from '../context/GameUserContext';
import { formatCoin } from '../api/rpgClient';
import SettingsModal from './SettingsModal';
import '../styles/TopBar.css';

const COIN_IMG = '/images/ui/coin.png';

const getPhoneScreenEl = () => document.getElementById('phoneScreen');

const TopBar = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { coins } = useGameUser();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const openSettings = () => {
    setMenuOpen(false);
    setSettingsOpen(true);
  };

  const goMenu = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const phoneScreen = typeof document !== 'undefined' ? getPhoneScreenEl() : null;
  const menuPortal =
    menuOpen && phoneScreen
      ? createPortal(
          <>
            <div
              className="top-bar-more__scrim"
              role="presentation"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />
            <div
              id={menuId}
              className="top-bar-more__panel"
              role="menu"
              aria-label="공지 및 이벤트"
            >
              <button
                type="button"
                className="top-bar-more__item"
                role="menuitem"
                onClick={() => goMenu('/announcements')}
              >
                <span aria-hidden>📢</span>
                공지사항
              </button>
              <button
                type="button"
                className="top-bar-more__item"
                role="menuitem"
                onClick={() => goMenu('/events')}
              >
                <span aria-hidden>🎁</span>
                이벤트
              </button>
            </div>
          </>,
          phoneScreen
        )
      : null;

  return (
    <>
    <div className="top-bar">
      <div className="top-bar-left" style={{ paddingRight: '12px' }}>
        <button
          type="button"
          className="top-profile-trigger"
          onClick={() => navigate('/profile')}
          aria-label="프로필 열기"
        >
          <div className="top-profile-icon">{profile.avatar || '🥚'}</div>
          <div className="top-nickname">{profile.realName?.trim() || profile.nickname || '이름'}</div>
        </button>
        <span className="top-bar-sep" aria-hidden>|</span>
        <div className="top-coin">
          <img className="top-coin-icon" src={COIN_IMG} alt="" width={18} height={18} decoding="async" />
          <span className="top-coin-amount">{formatCoin(coins)}</span>
        </div>
      </div>
      <div className="top-bar-right">
        <button type="button" className="top-btn" onClick={() => navigate('/shop')}>
          <span>🛒</span>
          <span className="top-btn-text">상점</span>
        </button>
        <button type="button" className="top-btn" onClick={openSettings} aria-label="설정 열기">
          <span>⚙️</span>
          <span className="top-btn-text">설정</span>
        </button>
        <button
          type="button"
          className="top-btn"
          aria-label="공지·이벤트 메뉴"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-controls={menuId}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span aria-hidden>☰</span>
          <span className="top-btn-text">메뉴</span>
        </button>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
    {menuPortal}
    </>
  );
};

export default TopBar;
