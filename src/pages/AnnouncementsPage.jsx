import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BulletinBoard from '../components/BulletinBoard';
import { fetchRpgJson } from '../api/rpgClient';
import '../styles/AnnouncementsPage.css';

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const AnnouncementsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await fetchRpgJson('/api/announcements');
        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      } catch {
        if (!alive) return;
        setItems([]);
        setError('공지사항 API 연결에 실패하여 로컬 게시판 모드로 표시합니다.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const openDetail = async (id) => {
    try {
      const data = await fetchRpgJson(`/api/announcements/${id}`);
      setSelected(data);
    } catch {
      setError('공지 상세를 불러오지 못했습니다.');
    }
  };

  return (
    <div className="screen active" id="screenAnnouncements">
      <TopBar />
      {error ? (
        <main className="bulletin-page__scroll">
          <BulletinBoard boardKey="announcements" heading="공지사항" emoji="📢" />
        </main>
      ) : (
        <main className="announcements-page">
          <h1 className="announcements-page__title">📢 공지사항</h1>
          {loading ? <p className="announcements-page__state">불러오는 중...</p> : null}
          {!loading && (
            <ul className="announcements-list" aria-label="공지사항 목록">
              {items.length === 0 ? (
                <li className="announcements-page__state">등록된 공지사항이 없습니다.</li>
              ) : (
                items.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="announcement-row" onClick={() => openDetail(item.id)}>
                      <div className="announcement-row__title">{item.title}</div>
                      <time className="announcement-row__time" dateTime={item.createdAt}>
                        {formatDate(item.createdAt)}
                      </time>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </main>
      )}

      {selected && (
        <div className="announcement-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <article
            className="announcement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="announcement-modal__head">
              <h2 id="announcement-detail-title" className="announcement-modal__title">
                {selected.title}
              </h2>
              <button type="button" className="announcement-modal__close" onClick={() => setSelected(null)}>
                닫기
              </button>
            </header>
            <time className="announcement-modal__time" dateTime={selected.createdAt}>
              {formatDate(selected.createdAt)}
            </time>
            <div className="announcement-modal__body">{selected.content}</div>
          </article>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default AnnouncementsPage;
