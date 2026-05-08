import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useGameUser } from '../context/GameUserContext';
import { formatCoin } from '../api/rpgClient';
import SettingsModal from './SettingsModal';
import '../styles/TopBar.css';

const COIN_IMG = '/images/ui/coin.png';
const SHOP_ICON = '/images/ui/icon_shop.png';
const SETTINGS_ICON = '/images/ui/icon_settings.png';

const TopBar = () => {
  const navigate = useNavigate();
  const { me } = useAuth();
  const { profile } = useProfile();
  const { coins } = useGameUser();
  const displayNick =
    me?.user?.nickname?.trim() || profile.realName?.trim() || profile.nickname || '이름';
  const displayCoin = formatCoin(coins);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="top-bar">
      <div className="top-bar-left" style={{ paddingRight: '12px' }}>
        <button
          type="button"
          className="top-profile-trigger"
          onClick={() => navigate('/profile')}
          aria-label="프로필 열기"
        >
          <div className="top-profile-icon">{profile.avatar || '🥚'}</div>
          <div className="top-nickname">{displayNick}</div>
        </button>
        <span className="top-bar-sep" aria-hidden>|</span>
        <div className="top-coin">
          <img className="top-coin-icon" src={COIN_IMG} alt="" width={18} height={18} decoding="async" />
          <span className="top-coin-amount">{displayCoin}</span>
        </div>
      </div>
      <div className="top-bar-right">
        <button type="button" className="top-btn" onClick={() => navigate('/shop')} aria-label="상점">
          <img className="top-btn-icon" src={SHOP_ICON} alt="" width={20} height={20} decoding="async" />
        </button>
        <button type="button" className="top-btn" onClick={() => setSettingsOpen(true)} aria-label="설정 열기">
          <img className="top-btn-icon" src={SETTINGS_ICON} alt="" width={20} height={20} decoding="async" />
        </button>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default TopBar;
