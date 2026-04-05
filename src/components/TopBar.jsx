import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import '../styles/TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

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
          <div className="top-nickname">{profile.realName?.trim() || profile.nickname || '이름'}</div>
        </button>
        <div style={{ color: 'var(--border)', margin: '0', fontSize: '15px', fontWeight: 'bold' }}>|</div>
        <div className="top-coin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>🪙</span>
          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '12px', color: 'var(--gold2)', textShadow: '1px 1px 0 var(--bg-wood)' }}>1,200</span>
        </div>
      </div>
      <div className="top-bar-right">
        <button className="top-btn" onClick={() => navigate('/shop')}>
          <span>🛒</span>
          <span className="top-btn-text">상점</span>
        </button>
        <button className="top-btn" onClick={() => console.log('설정 클릭')}>
          <span>⚙️</span>
          <span className="top-btn-text">설정</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
