import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="top-profile-icon">🥚</div>
        <div className="top-nickname">닉네임</div>
      </div>
      <div className="top-bar-right">
        <button className="top-btn" onClick={() => console.log('상점 클릭')}>
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
