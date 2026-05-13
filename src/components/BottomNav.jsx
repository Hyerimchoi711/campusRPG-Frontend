import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

/** 프레임 안에 들어가는 아이콘 (1:1, 픽셀 아트) */
const ICON_SIZE = 32;

/** 일정·퀘스트 아이콘 교체 시 브라우저 캐시 무효화 */
const NAV_ICON_TODO = '/images/bottom-nav/bottomnav_icon_todo.png?v=20260511';
const NAV_ICON_QUEST = '/images/bottom-nav/bottomnav_icon_quest.png?v=20260511';
const NAV_ICON_FRIEND = '/images/bottom-nav/bottomnav_icon_friend.png?v=20260512';

/**
 * path 순서 = 바에 표시 순서 (보관함 · 일정 · 홈 · 퀘스트 · 친구)
 * icon: null 이면 emoji 문자 사용 (가방 PNG 추가 시 icon 으로 교체 가능)
 */
const NAV_ITEMS = [
  { path: '/inventory', label: '보관함', icon: '/images/bottom-nav/bottomnav_icon_inventory.png' },
  { path: '/todo', label: '일정', icon: NAV_ICON_TODO },
  { path: '/home', label: '홈', icon: '/images/bottom-nav/bottomnav_icon_home.png' },
  { path: '/quests', label: '퀘스트', icon: NAV_ICON_QUEST },
  { path: '/friends', label: '친구', icon: NAV_ICON_FRIEND },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {NAV_ITEMS.map(({ path, label, icon, emoji }) => {
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
                    className={`nav-item-icon-img${path === '/inventory' ? ' nav-item-icon-img--inventory' : ''}${
                      path === '/todo' || path === '/quests' ? ' nav-item-icon-img--todo-quest' : ''
                    }`}
                    src={icon}
                    alt=""
                    width={path === '/todo' || path === '/quests' ? 49 : ICON_SIZE}
                    height={path === '/todo' || path === '/quests' ? 49 : ICON_SIZE}
                    decoding="async"
                  />
                ) : (
                  <span className="nav-item-icon-fallback nav-item-icon-fallback--emoji" title={label}>
                    {emoji || '🏠'}
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
