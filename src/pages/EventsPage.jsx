import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BulletinBoard from '../components/BulletinBoard';
import { fetchRpgJson } from '../api/rpgClient';
import '../styles/EventsPage.css';

const EventsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await fetchRpgJson('/api/events');
        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      } catch {
        if (!alive) return;
        setItems([]);
        setError('이벤트 API 연결에 실패하여 로컬 게시판 모드로 표시합니다.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="screen active" id="screenEvents">
      <TopBar />
      {error ? (
        <main className="bulletin-page__scroll">
          <BulletinBoard boardKey="events" heading="이벤트" emoji="🎁" />
        </main>
      ) : (
        <main className="events-page">
          <h1 className="events-page__title">🎁 이벤트</h1>
          {loading ? <p className="events-page__state">불러오는 중...</p> : null}
          {!loading && (
            <div className="events-grid" aria-label="이벤트 목록">
              {items.length === 0 ? (
                <p className="events-page__state">진행 중인 이벤트가 없습니다.</p>
              ) : (
                items.map((item) => (
                  <a
                    key={item.id}
                    href={item.linkUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`event-card${item.linkUrl ? '' : ' event-card--disabled'}`}
                    aria-label={item.title || '이벤트 상세 링크'}
                    onClick={(e) => {
                      if (!item.linkUrl) e.preventDefault();
                    }}
                  >
                    <img className="event-card__img" src={item.imageUrl} alt={item.title || '이벤트 이미지'} />
                  </a>
                ))
              )}
            </div>
          )}
        </main>
      )}
      <BottomNav />
    </div>
  );
};

export default EventsPage;
