import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="screen active" id="screenLogin">
      <div className="login-bg"></div>
      <div className="login-content">
        <div className="game-logo">
          <div className="logo-pixel">CQ</div>
          <div className="logo-title">CampusQuest</div>
          <div className="logo-sub">나의 대학생활을 RPG로</div>
        </div>
        <div className="login-form">
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input type="text" placeholder="학번 또는 이메일" className="game-input" />
          </div>
          <div className="input-group">
            <span className="input-icon">🔑</span>
            <input type="password" placeholder="비밀번호" className="game-input" />
          </div>
          <button className="btn-primary" onClick={() => navigate('/home')}>
            <span>모험 시작!</span>
            <div className="btn-shine"></div>
          </button>
          <button className="btn-secondary" onClick={() => navigate('/home')}>
            새 알 부화하기
          </button>
        </div>
        <div className="login-deco">
          <div className="pixel-char char-idle" id="loginChar">🥚</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
