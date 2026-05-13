import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY } from '../constants/authStorage';
import PetPortrait from '../components/PetPortrait';
import {
  DEFAULT_EGG_PET_NAME,
  getLineageBadgeText,
  getPetSpeciesLabel,
  isPetEgg,
} from '../models/pet';
import { useStatsModal } from '../context/StatsModalContext';
import { ME_EXP_PER_LEVEL } from '../api/meContract';
import { getHomeBackgroundUrlForPet } from '../config/homePetVisuals';
import '../styles/HomePage.css';

function petSubtitle(pet) {
  if (!pet) return '로그인 후 동료를 만나요';
  if (isPetEgg(pet)) {
    return '부화를 기다리는 중';
  }
  return '함께 모험 중';
}

const HomePage = () => {
  const navigate = useNavigate();
  const { openStats } = useStatsModal();
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
  const userLevel =
    user != null && Number.isFinite(Number(user.level))
      ? Math.max(1, Math.floor(Number(user.level)))
      : 1;
  const exp = user?.exp ?? 0;
  const expCeil = ME_EXP_PER_LEVEL;
  const pct = Math.min(100, Math.round((exp / expCeil) * 1000) / 10);
  const homeBgUrl = getHomeBackgroundUrlForPet(pet);

  const petName = pet?.name ?? DEFAULT_EGG_PET_NAME;
  const titleLine = petSubtitle(pet);
  const eggUi = isPetEgg(pet);
  const lineageBadge = !eggUi && pet ? getLineageBadgeText(pet.lineageType) : null;
  const speciesLabel = pet && !eggUi ? getPetSpeciesLabel(pet.animalType) : null;

  return (
    <div className="screen active" id="screenHome">
      <div
        className="home-immersive"
        style={{ '--home-bg-image': `url(${homeBgUrl})` }}
      >
        <TopBar />
        <div className="home-container">
          {loading && !user ? (
            <div className="home-loading">불러오는 중…</div>
          ) : null}

          <div className="home-level-stats-row">
            <div className="home-level-box">Lv. {userLevel}</div>
            <button
              type="button"
              className="home-hud-btn"
              onClick={() => openStats()}
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

          <div className="home-nest-stage" aria-label={eggUi ? '둥지와 부화중인 알' : '둥지와 동료'}>
            <img
              src="/images/home/nest.png"
              alt=""
              className="home-nest-img"
              decoding="async"
            />
            <div className="home-egg-wrap">
              <div className="pet-egg-hitbox home-egg-hitbox">
                <PetPortrait
                  animalType={pet?.animalType ?? 'egg'}
                  alt="펫"
                  imgClassName="home-character-img pet-egg-hop"
                />
              </div>
            </div>
          </div>

          <div className="home-info-box">
            {(lineageBadge || speciesLabel) ? (
              <div className="home-pet-badge-row">
                {lineageBadge ? <div className="home-pet-lineage-badge">계보 · {lineageBadge}</div> : null}
                {speciesLabel ? <div className="home-pet-species-badge">{speciesLabel}</div> : null}
              </div>
            ) : null}
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
