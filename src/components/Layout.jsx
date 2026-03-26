import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* 좌측 장식 패널 */}
      <aside className="side-panel left-panel">
        <div className="panel-frame">
          <div className="panel-title">CAMPUS<br/>QUEST</div>
          <div className="panel-deco">
            <div className="deco-line"></div>
            <div className="deco-stat-preview">
              <span className="stat-label">성실함</span>
              <div className="stat-bar-mini"><div className="fill" style={{width: '72%'}}></div></div>
              <span className="stat-label">나태함</span>
              <div className="stat-bar-mini"><div className="fill lazy" style={{width: '28%'}}></div></div>
              <span className="stat-label">사교성</span>
              <div className="stat-bar-mini"><div className="fill social" style={{width: '55%'}}></div></div>
              <span className="stat-label">집중력</span>
              <div className="stat-bar-mini"><div className="fill focus" style={{width: '80%'}}></div></div>
            </div>
            <div className="deco-line"></div>
          </div>
          <div className="panel-quote">"오늘의 퀘스트가<br/>내일의 전설이 된다"</div>
        </div>
        {/* <div className="floating-icons">
          <div className="fi fi1">🌻</div>
          <div className="fi fi2">📚</div>
          <div className="fi fi3">⭐</div>
          <div className="fi fi4">🍃</div>
        </div> */}
      </aside>

      {/* 우측 장식 패널 */}
      <aside className="side-panel right-panel">
        <div className="panel-frame">
          <div className="panel-title">RANK<br/>BOARD</div>
          <div className="rank-list">
            <div className="rank-item gold">
              <span className="rank-num">01</span>
              <div className="rank-avatar" style={{background: '#f5c06e'}}>🧙</div>
              <div className="rank-info">
                <span className="rank-name">김현우</span>
                <span className="rank-class">현자 Lv.42</span>
              </div>
              <span className="rank-xp">9,840 XP</span>
            </div>
            <div className="rank-item silver">
              <span className="rank-num">02</span>
              <div className="rank-avatar" style={{background: '#a8d8ea'}}>🧝</div>
              <div className="rank-info">
                <span className="rank-name">이지은</span>
                <span className="rank-class">탐험가 Lv.38</span>
              </div>
              <span className="rank-xp">8,210 XP</span>
            </div>
            <div className="rank-item bronze">
              <span className="rank-num">03</span>
              <div className="rank-avatar" style={{background: '#b5e8c3'}}>🧑‍💻</div>
              <div className="rank-info">
                <span className="rank-name">박서준</span>
                <span className="rank-class">해커 Lv.35</span>
              </div>
              <span className="rank-xp">7,650 XP</span>
            </div>
            <div className="rank-item">
              <span className="rank-num">04</span>
              <div className="rank-avatar" style={{background: '#f8b4c4'}}>🧚</div>
              <div className="rank-info">
                <span className="rank-name">최민지</span>
                <span className="rank-class">예술가 Lv.31</span>
              </div>
              <span className="rank-xp">6,400 XP</span>
            </div>
            <div className="rank-item">
              <span className="rank-num">05</span>
              <div className="rank-avatar" style={{background: '#ffd4a3'}}>🧑‍🎓</div>
              <div className="rank-info">
                <span className="rank-name">정도윤</span>
                <span className="rank-class">학자 Lv.28</span>
              </div>
              <span className="rank-xp">5,980 XP</span>
            </div>
          </div>
          <div className="deco-line"></div>
          <div className="today-event">
            <div className="event-badge">TODAY</div>
            <div className="event-text">🌟 더블 XP 데이!</div>
            <div className="event-sub">오늘 퀘스트 완료 시<br/>경험치 2배 획득</div>
          </div>
        </div>
        {/* <div className="floating-icons right">
          <div className="fi fi5">🎯</div>
          <div className="fi fi6">🌸</div>
          <div className="fi fi7">🎮</div>
          <div className="fi fi8">💎</div>
        </div> */}
      </aside>

      {/* 중앙 스마트폰 영역 */}
      <main className="phone-stage">
        <div className="phone-glow"></div>
        <div className="phone-frame">
          <div className="phone-notch">
            <div className="notch-camera"></div>
            <div className="notch-speaker"></div>
          </div>
          
          <div className="phone-screen" id="phoneScreen">
            <Outlet />
          </div>
          
          <div className="phone-home-btn"></div>
        </div>

        {/* 레벨업 오버레이 */}
        <div className="levelup-overlay" id="levelupOverlay">
          <div className="levelup-box">
            <div className="levelup-title">LEVEL UP!</div>
            <div className="levelup-num">Lv. 8</div>
            <div className="levelup-char">✨🧑‍🎓✨</div>
            <div className="levelup-rewards">
              <div className="lv-reward">성실함 +5</div>
              <div className="lv-reward">집중력 +3</div>
              <div className="lv-reward">💎 +50</div>
            </div>
            <button className="btn-primary small" onClick={() => window.closeLevelup()}>계속하기</button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;
