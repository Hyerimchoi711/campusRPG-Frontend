import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      <div className="top-bar-left" style={{ paddingRight: '12px' }}>
        <div className="top-profile-icon">🥚</div>
        <div className="top-nickname">김대학</div>
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
