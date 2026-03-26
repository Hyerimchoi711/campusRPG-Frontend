import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/QuestsPage.css';

const QuestsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="screen active" id="screenQuests">
      <TopBar />

      {/* 오늘의 퀘스트 */}
      <div className="section-header">
        <span className="section-icon">📋</span>
        <span>오늘의 퀘스트</span>
        <span className="section-badge">3/5</span>
      </div>
      <div className="quest-list">
        <div className="quest-item done">
          <div className="quest-check">✓</div>
          <div className="quest-info">
            <div className="quest-name">아침 9시 전 기상</div>
            <div className="quest-reward">+50 XP · 성실함 +1</div>
          </div>
          <div className="quest-xp done-badge">완료</div>
        </div>
        <div className="quest-item done">
          <div className="quest-check">✓</div>
          <div className="quest-info">
            <div className="quest-name">강의 출석 완료</div>
            <div className="quest-reward">+80 XP · 성실함 +2</div>
          </div>
          <div className="quest-xp done-badge">완료</div>
        </div>
        <div className="quest-item done">
          <div className="quest-check">✓</div>
          <div className="quest-info">
            <div className="quest-name">도서관 2시간 공부</div>
            <div className="quest-reward">+120 XP · 집중력 +2</div>
          </div>
          <div className="quest-xp done-badge">완료</div>
        </div>
        <div className="quest-item active" onClick={(e) => window.completeQuest(e.currentTarget)}>
          <div className="quest-check empty">○</div>
          <div className="quest-info">
            <div className="quest-name">과제 제출하기</div>
            <div className="quest-reward">+150 XP · 성실함 +3</div>
          </div>
          <div className="quest-xp">+150</div>
        </div>
        <div className="quest-item" onClick={(e) => window.completeQuest(e.currentTarget)}>
          <div className="quest-check empty">○</div>
          <div className="quest-info">
            <div className="quest-name">동아리 활동 참여</div>
            <div className="quest-reward">+100 XP · 사교성 +2</div>
          </div>
          <div className="quest-xp">+100</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default QuestsPage;
