import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY } from '../constants/authStorage';
import homeForestBg from '../assets/images/home-forest-nest.png';
import '../styles/HomePage.css';

function petImageSrc(pet) {
  if (!pet || pet.evolutionStage === 0 || pet.animalType === 'egg') {
    return '/images/animals/egg.png';
  }
  return '/images/animals/egg.png';
}

function petSubtitle(pet) {
  if (!pet) return '키워주세요';
  if (pet.evolutionStage === 0 || pet.animalType === 'egg') {
    return '키워주세요';
  }
  return '함께 모험 중';
}

const HomePage = () => {
  const navigate = useNavigate();
  const { me, loading, refreshMe } = useAuth();

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (loading) return;
    if (!localStorage.getItem(TOKEN_KEY)) {
      navigate('/login', { replace: true });
    }
  }, [loading, navigate]);

  const user = me?.user;
  const pet = me?.pet;
  const level = pet?.level ?? 0;
  const exp = user?.exp ?? 0;
  const expCeil = Math.max(500, Math.max(1, level || 1) * 400);
  const pct = Math.min(100, Math.round((exp / expCeil) * 1000) / 10);

  const petName = pet?.name ?? '알';
  const titleLine = petSubtitle(pet);

  return (
    <div className="screen active" id="screenHome">
      <div
        className="home-immersive"
        style={{ '--home-bg-image': `url(${homeForestBg})` }}
      >
        <TopBar />
        <div className="home-container">
          {loading && !user ? (
            <div className="home-loading">불러오는 중…</div>
          ) : null}

          <div className="home-level-stats-row">
            <div className="home-level-box">Lv. {level}</div>
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
              <span>
                {exp.toLocaleString('ko-KR')} / {expCeil.toLocaleString('ko-KR')}
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${pct}%` }}>
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
                  src={petImageSrc(pet)}
                  alt="펫"
                  className="home-character-img pet-egg-hop"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="home-info-box">
            <div className="home-info-nickname">{petName}</div>
            <div className="home-info-title">{titleLine}</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
