import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import homeForestBg from '../assets/images/home-forest-nest.png';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="screen active" id="screenHome">
      <div
        className="home-immersive"
        style={{ '--home-bg-image': `url(${homeForestBg})` }}
      >
        <TopBar />
        <div className="home-container">
          <div className="home-level-stats-row">
            <div className="home-level-box">Lv. 0</div>
            <button
              type="button"
              className="home-hud-btn"
              onClick={() => navigate('/stats')}
              aria-label="스탯 보기"
            >
              <img
                className="home-hud-btn-icon"
                src="/images/bottom-nav/bottomnav_icon_stats.png"
                alt=""
                width={22}
                height={22}
                decoding="async"
              />
              <span className="home-hud-btn-text">스탯</span>
            </button>
          </div>

          <div className="xp-section home-xp-wrap">
            <div className="xp-label">
              <span>EXP</span>
              <span>1,240 / 2,000</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: '62%' }}>
                <div className="xp-shine" />
              </div>
            </div>
          </div>

          <div className="home-nest-stage" aria-label="둥지와 알">
            <img
              src="/images/home/nest.png"
              alt=""
              className="home-nest-img"
              decoding="async"
            />
            <div className="home-egg-wrap">
              <div className="pet-egg-hitbox home-egg-hitbox">
                <img
                  src="/images/animals/egg.png"
                  alt="알"
                  className="home-character-img pet-egg-hop"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="home-info-box">
            <div className="home-info-nickname">부화중인 알</div>
            <div className="home-info-title">키워주세요</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
