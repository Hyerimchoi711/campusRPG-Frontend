import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const AchievePage = () => {
  const navigate = useNavigate();

  return (
    <div className="screen active" id="screenAchieve">
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate('/home')}>←</button>
        <span>업적 & 뱃지</span>
        <span className="header-lv">12/40</span>
      </div>

      <div className="achieve-summary">
        <div className="achieve-count">
          <span className="ac-num">12</span>
          <span className="ac-label">달성 완료</span>
        </div>
        <div className="achieve-progress-wrap">
          <div className="achieve-progress-bar">
            <div className="achieve-progress-fill" style={{width: '30%'}}></div>
          </div>
          <span className="achieve-pct">30%</span>
        </div>
      </div>

      <div className="achieve-grid">
        <div className="achieve-card unlocked">
          <div className="ac-icon">🌅</div>
          <div className="ac-name">새벽의 전사</div>
          <div className="ac-desc">7일 연속 9시 전 기상</div>
        </div>
        <div className="achieve-card unlocked">
          <div className="ac-icon">📖</div>
          <div className="ac-name">독서광</div>
          <div className="ac-desc">도서관 10회 방문</div>
        </div>
        <div className="achieve-card unlocked">
          <div className="ac-icon">🎯</div>
          <div className="ac-name">퀘스트 마스터</div>
          <div className="ac-desc">퀘스트 50개 완료</div>
        </div>
        <div className="achieve-card unlocked">
          <div className="ac-icon">🔥</div>
          <div className="ac-name">불꽃 의지</div>
          <div className="ac-desc">7일 연속 로그인</div>
        </div>
        <div className="achieve-card unlocked">
          <div className="ac-icon">🤝</div>
          <div className="ac-name">인맥왕</div>
          <div className="ac-desc">동아리 5회 참여</div>
        </div>
        <div className="achieve-card locked">
          <div className="ac-icon">🏅</div>
          <div className="ac-name">?????</div>
          <div className="ac-desc">Lv.15 달성 시 해금</div>
        </div>
        <div className="achieve-card locked">
          <div className="ac-icon">💎</div>
          <div className="ac-name">?????</div>
          <div className="ac-desc">성실함 100 달성</div>
        </div>
        <div className="achieve-card locked">
          <div className="ac-icon">👑</div>
          <div className="ac-name">?????</div>
          <div className="ac-desc">전설 등급 달성</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AchievePage;
