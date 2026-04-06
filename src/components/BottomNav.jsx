import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

/** 프레임 안에 들어가는 아이콘 (1:1, 픽셀 아트) */
const ICON_SIZE = 32;

/**
 * path 순서 = 바에 표시 순서 (스탯 · 일정 · 홈 · 퀘스트 · 친구)
 * icon: null 이면 아래 홈처럼 임시 표시(이미지 준비 후 public 경로 문자열로 교체)
 */
const NAV_ITEMS = [
  { path: '/stats', label: '스탯', icon: '/images/bottom-nav/bottomnav_icon_stats.png' },
  { path: '/todo', label: '일정', icon: '/images/bottom-nav/bottomnav_icon_todo.png' },
  { path: '/home', label: '홈', icon: '/images/bottom-nav/bottomnav_icon_home.png' },
  { path: '/quests', label: '퀘스트', icon: '/images/bottom-nav/bottomnav_icon_quest.png' },
  { path: '/friends', label: '친구', icon: '/images/bottom-nav/bottomnav_icon_friend.png' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {NAV_ITEMS.map(({ path, label, icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-item-icon-frame" aria-hidden>
              <span className="nav-item-icon-inner">
                {icon ? (
                  <img
                    className="nav-item-icon-img"
                    src={icon}
                    alt=""
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    decoding="async"
                  />
                ) : (
                  <span className="nav-item-icon-fallback" title="홈 아이콘 제작 중">
                    🏠
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
