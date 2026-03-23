import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="bottom-nav">
      <div className={`nav-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
        <span>🏠</span><span>홈</span>
      </div>
      <div className={`nav-item ${isActive('/stats')}`} onClick={() => navigate('/stats')}>
        <span>📊</span><span>스탯</span>
      </div>
      <div className={`nav-item ${isActive('/avatar')}`} onClick={() => navigate('/avatar')}>
        <span>🧙</span><span>아바타</span>
      </div>
      <div className={`nav-item ${isActive('/achieve')}`} onClick={() => navigate('/achieve')}>
        <span>🏆</span><span>업적</span>
      </div>
    </div>
  );
};

export default BottomNav;
