import React, { useEffect, useState } from 'react';
import { useRole } from '../context/RoleContext';
import { loadBoard, saveBoard, newBulletinItem } from '../utils/bulletinStorage';
import '../styles/BulletinBoard.css';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/** boardKey: 'announcements' | 'events' */
const BulletinBoard = ({ boardKey, heading, emoji = '📌' }) => {
  const { isAdmin } = useRole();
  const [items, setItems] = useState(() => loadBoard(boardKey));
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  useEffect(() => {
    setItems(loadBoard(boardKey));
  }, [boardKey]);

  const persist = (next) => {
    saveBoard(boardKey, next);
    setItems(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const t = draftTitle.trim();
    const b = draftBody.trim();
    if (!t || !b) return;
    const item = newBulletinItem(t, b);
    persist([item, ...items]);
    setDraftTitle('');
    setDraftBody('');
  };

  const remove = (id) => {
    if (!isAdmin) return;
    persist(items.filter((x) => x.id !== id));
  };

  return (
    <div className="bulletin-board">
      <header className="bulletin-board__head">
        <h1 className="bulletin-board__title">
          <span aria-hidden>{emoji}</span> {heading}
        </h1>
        {!isAdmin && (
          <p className="bulletin-board__hint">글 읽기만 가능합니다. 작성은 관리자만 할 수 있어요.</p>
        )}
      </header>

      {isAdmin && (
        <form className="bulletin-board__composer" onSubmit={handleSubmit}>
          <label className="bulletin-board__field">
            <span className="bulletin-board__label">제목</span>
            <input
              className="bulletin-board__input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={200}
              autoComplete="off"
            />
          </label>
          <label className="bulletin-board__field">
            <span className="bulletin-board__label">내용</span>
            <textarea
              className="bulletin-board__textarea"
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={5}
              maxLength={20000}
            />
          </label>
          <button type="submit" className="bulletin-board__submit">
            등록하기
          </button>
        </form>
      )}

      <ul className="bulletin-board__list" aria-label={`${heading} 목록`}>
        {items.length === 0 ? (
          <li className="bulletin-board__empty">등록된 글이 없습니다.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="bulletin-card">
              <div className="bulletin-card__head">
                <h2 className="bulletin-card__title">{item.title}</h2>
                <div className="bulletin-card__meta">
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                  {isAdmin && (
                    <button
                      type="button"
                      className="bulletin-card__del"
                      onClick={() => remove(item.id)}
                      aria-label="이 글 삭제"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <div className="bulletin-card__body">{item.body}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default BulletinBoard;
