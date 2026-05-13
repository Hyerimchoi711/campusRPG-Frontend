import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
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
        setError('이벤트를 불러오지 못했습니다. 서버/DB 연결을 확인해 주세요.');
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
      <main className="events-page">
        <h1 className="events-page__title">🎁 이벤트</h1>
        {loading ? <p className="events-page__state">불러오는 중...</p> : null}
        {error ? (
          <p className="events-page__state events-page__state--error" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && (
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
      <BottomNav />
    </div>
  );
};

export default EventsPage;
