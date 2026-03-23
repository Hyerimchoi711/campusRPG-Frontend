import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const AvatarPage = () => {
  const navigate = useNavigate();

  return (
    <div className="screen active" id="screenAvatar">
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate('/home')}>←</button>
        <span>나의 아바타</span>
        <span className="header-lv">Lv.7</span>
      </div>

      <div className="avatar-showcase">
        <div className="avatar-bg-glow"></div>
        <div className="current-avatar" id="currentAvatarDisplay">🧑‍🎓</div>
        <div className="avatar-class-name">새싹 모험가</div>
        <div className="avatar-class-desc">성실함이 쌓이면 더 강한 클래스로 진화합니다!</div>
      </div>

      {/* 진화 경로 */}
      <div className="evolution-section">
        <div className="evo-title">캐릭터 진화 경로</div>
        <div className="evo-path">
          <div className="evo-node current">
            <div className="evo-char">🧑‍🎓</div>
            <div className="evo-name">새싹<br/>모험가</div>
            <div className="evo-req">현재</div>
          </div>
          <div className="evo-arrow">→</div>
          <div className="evo-node locked">
            <div className="evo-char">🧑‍💻</div>
            <div className="evo-name">열정<br/>학도</div>
            <div className="evo-req">Lv.15</div>
          </div>
          <div className="evo-arrow">→</div>
          <div className="evo-node locked">
            <div className="evo-char">🧙</div>
            <div className="evo-name">지식<br/>현자</div>
            <div className="evo-req">Lv.30</div>
          </div>
          <div className="evo-arrow">→</div>
          <div className="evo-node locked">
            <div className="evo-char">👑</div>
            <div className="evo-name">전설의<br/>졸업생</div>
            <div className="evo-req">Lv.50</div>
          </div>
        </div>
      </div>

      {/* 클래스 분기 */}
      <div className="class-branch">
        <div className="branch-title">스탯 기반 클래스 분기</div>
        <div className="branch-grid">
          <div className="branch-card" style={{borderColor: '#f5c06e'}}>
            <div className="bc-icon">📚</div>
            <div className="bc-name">학자형</div>
            <div className="bc-cond">성실함 80+</div>
          </div>
          <div className="branch-card" style={{borderColor: '#a8d8ea'}}>
            <div className="bc-icon">🎨</div>
            <div className="bc-name">창작형</div>
            <div className="bc-cond">창의력 80+</div>
          </div>
          <div className="branch-card" style={{borderColor: '#b5e8c3'}}>
            <div className="bc-icon">🤝</div>
            <div className="bc-name">사교형</div>
            <div className="bc-cond">사교성 80+</div>
          </div>
          <div className="branch-card" style={{borderColor: '#f8b4c4'}}>
            <div className="bc-icon">😈</div>
            <div className="bc-name">방랑자형</div>
            <div className="bc-cond">나태함 70+</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AvatarPage;
