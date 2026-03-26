import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="bottom-nav">
      <div className={`nav-item ${isActive('/stats')}`} onClick={() => navigate('/stats')}>
        <span>📊</span><span>스탯</span>
      </div>
      <div className={`nav-item ${isActive('/todo')}`} onClick={() => navigate('/todo')}>
        <span>📅</span><span>일정</span>
      </div>
      <div className={`nav-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
        <span>🏠</span><span>홈</span>
      </div>
      <div className={`nav-item ${isActive('/quests')}`} onClick={() => navigate('/quests')}>
        <span>📋</span><span>퀘스트</span>
      </div>
      <div className={`nav-item ${isActive('/friends')}`} onClick={() => navigate('/friends')}>
        <span>👥</span><span>친구</span>
      </div>
    </div>
  );
};

export default BottomNav;
