import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/QuestsPage.css';

const QuestsPage = () => {
  const navigate = useNavigate();
  
  // 아코디언 상태 관리 (기본값: false = 접힘)
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(false);

  return (
    <div className="screen active" id="screenQuests">
      <TopBar />

      <div className="quests-content-wrapper" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* 일일 퀘스트 */}
        <div className="section-header" onClick={() => setIsDailyOpen(!isDailyOpen)}>
          <span className="section-icon">📋</span>
          <span>일일 퀘스트</span>
          <span className="section-toggle">{isDailyOpen ? '▲' : '▼'}</span>
          <span className="section-badge">3/5</span>
        </div>
        
        {isDailyOpen && (
          <div className="quest-list daily" style={{ marginBottom: '10px' }}>
            <div className="quest-item done">
              <div className="quest-check">✓</div>
              <div className="quest-info">
                <div className="quest-name">아침 9시 전 기상</div>
                <div className="quest-reward">+50 코인 · 성실함 +1</div>
              </div>
              <div className="quest-xp done-badge">완료</div>
            </div>
            <div className="quest-item done">
              <div className="quest-check">✓</div>
              <div className="quest-info">
                <div className="quest-name">강의 출석 완료</div>
                <div className="quest-reward">+80 코인 · 성실함 +2</div>
              </div>
              <div className="quest-xp done-badge">완료</div>
            </div>
            <div className="quest-item done">
              <div className="quest-check">✓</div>
              <div className="quest-info">
                <div className="quest-name">도서관 2시간 공부</div>
                <div className="quest-reward">+120 코인 · 집중력 +2</div>
              </div>
              <div className="quest-xp done-badge">완료</div>
            </div>
            <div className="quest-item active" onClick={(e) => window.completeQuest(e.currentTarget)}>
              <div className="quest-check empty">○</div>
              <div className="quest-info">
                <div className="quest-name">과제 제출하기</div>
                <div className="quest-reward">+150 코인 · 성실함 +3</div>
              </div>
              <div className="quest-xp">+150 코인</div>
            </div>
            <div className="quest-item" onClick={(e) => window.completeQuest(e.currentTarget)}>
              <div className="quest-check empty">○</div>
              <div className="quest-info">
                <div className="quest-name">동아리 활동 참여</div>
                <div className="quest-reward">+100 코인 · 사교성 +2</div>
              </div>
              <div className="quest-xp">+100 코인</div>
            </div>
          </div>
        )}

        {/* 주간 퀘스트 */}
        <div className="section-header" onClick={() => setIsWeeklyOpen(!isWeeklyOpen)}>
          <span className="section-icon">📅</span>
          <span>주간 퀘스트</span>
          <span className="section-toggle">{isWeeklyOpen ? '▲' : '▼'}</span>
          <span className="section-badge">0/3</span>
        </div>
        
        {isWeeklyOpen && (
          <div className="quest-list weekly" style={{ marginBottom: '10px' }}>
            <div className="quest-item" onClick={(e) => window.completeQuest(e.currentTarget)}>
              <div className="quest-check empty">○</div>
              <div className="quest-info">
                <div className="quest-name">전공 서적 1권 읽기</div>
                <div className="quest-reward">+500 코인 · 지능 +5</div>
              </div>
              <div className="quest-xp">+500 코인</div>
            </div>
            <div className="quest-item" onClick={(e) => window.completeQuest(e.currentTarget)}>
              <div className="quest-check empty">○</div>
              <div className="quest-info">
                <div className="quest-name">운동 3회 이상 하기</div>
                <div className="quest-reward">+300 코인 · 건강 +5</div>
              </div>
              <div className="quest-xp">+300 코인</div>
            </div>
            <div className="quest-item" onClick={(e) => window.completeQuest(e.currentTarget)}>
              <div className="quest-check empty">○</div>
              <div className="quest-info">
                <div className="quest-name">새로운 친구 1명 사귀기</div>
                <div className="quest-reward">+400 코인 · 사교성 +5</div>
              </div>
              <div className="quest-xp">+400 코인</div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default QuestsPage;
