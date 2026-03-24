import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const StatsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.animateStatBars) {
      window.animateStatBars();
    }
  }, []);

  return (
    <div className="screen active" id="screenStats">
      <TopBar />
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate('/home')}>←</button>
        <span>캐릭터 스탯</span>
        <span className="header-lv">Lv.7</span>
      </div>

      <div className="stat-avatar-section">
        <div className="stat-avatar-wrap">
          <div className="stat-avatar-glow"></div>
          <div className="stat-avatar-char">🧑‍🎓</div>
          <div className="stat-avatar-name">새싹 모험가</div>
        </div>
      </div>

      {/* 레이더 차트 영역 (CSS 구현) */}
      <div className="radar-wrap">
        <div className="radar-bg">
          <div className="radar-ring r1"></div>
          <div className="radar-ring r2"></div>
          <div className="radar-ring r3"></div>
          <div className="radar-label rl1">성실함</div>
          <div className="radar-label rl2">집중력</div>
          <div className="radar-label rl3">사교성</div>
          <div className="radar-label rl4">나태함</div>
          <div className="radar-label rl5">창의력</div>
          <div className="radar-label rl6">체력</div>
          <svg className="radar-svg" viewBox="0 0 200 200">
            <polygon className="radar-area" points="100,30 155,65 155,135 100,170 45,135 45,65"/>
            <polygon className="radar-fill" points="100,45 140,72 138,128 100,152 62,128 60,72"/>
          </svg>
        </div>
      </div>

      {/* 스탯 상세 */}
      <div className="stat-detail-list">
        <div className="stat-row">
          <span className="stat-icon">💪</span>
          <span className="stat-name">성실함</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill diligent" style={{width: '72%'}}></div>
            </div>
          </div>
          <span className="stat-val">72</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🎯</span>
          <span className="stat-name">집중력</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill focus" style={{width: '80%'}}></div>
            </div>
          </div>
          <span className="stat-val">80</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🤝</span>
          <span className="stat-name">사교성</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill social" style={{width: '55%'}}></div>
            </div>
          </div>
          <span className="stat-val">55</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">😴</span>
          <span className="stat-name">나태함</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill lazy" style={{width: '28%'}}></div>
            </div>
          </div>
          <span className="stat-val">28</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">💡</span>
          <span className="stat-name">창의력</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill creative" style={{width: '63%'}}></div>
            </div>
          </div>
          <span className="stat-val">63</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🏃</span>
          <span className="stat-name">체력</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill health" style={{width: '45%'}}></div>
            </div>
          </div>
          <span className="stat-val">45</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default StatsPage;
