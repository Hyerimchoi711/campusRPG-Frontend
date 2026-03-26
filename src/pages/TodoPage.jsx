import React, { useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/TodoPage.css';

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date) => {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
};

const TodoPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [newTodo, setNewTodo] = useState('');
  const [todoByDate, setTodoByDate] = useState({
    '2026-03-24': [
      { id: 1, text: '운영체제 과제 제출', done: true, category: '학업', source: 'manual' },
      { id: 2, text: '스터디 모임 참석', done: false, category: '동아리', source: 'manual' },
    ],
    '2026-03-25': [
      { id: 3, text: '중간고사 시간표 확인', done: false, category: '학사일정', source: 'academic' },
      { id: 4, text: '헬스장 1시간', done: false, category: '건강', source: 'manual' },
    ],
  });

  const calendarMeta = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= lastDate; day += 1) {
      const dateKey = toDateKey(new Date(year, monthIndex, day));
      cells.push(dateKey);
    }

    return {
      title: `${year}년 ${monthIndex + 1}월`,
      cells,
      year,
      monthIndex,
    };
  }, []);

  const selectedTodos = useMemo(() => todoByDate[selectedDate] ?? [], [todoByDate, selectedDate]);
  const completedCount = useMemo(
    () => selectedTodos.filter((todo) => todo.done).length,
    [selectedTodos],
  );

  const handleAddTodo = () => {
    const value = newTodo.trim();
    if (!value) return;

    setTodoByDate((prev) => {
      const currentTodos = prev[selectedDate] ?? [];
      return {
        ...prev,
        [selectedDate]: [
          ...currentTodos,
          { id: Date.now(), text: value, done: false, category: '개인', source: 'manual' },
        ],
      };
    });
    setNewTodo('');
  };

  const handleToggleTodo = (id) => {
    setTodoByDate((prev) => {
      const currentTodos = prev[selectedDate] ?? [];
      return {
        ...prev,
        [selectedDate]: currentTodos.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo,
        ),
      };
    });
  };

  const handleDeleteTodo = (id) => {
    setTodoByDate((prev) => {
      const currentTodos = prev[selectedDate] ?? [];
      return {
        ...prev,
        [selectedDate]: currentTodos.filter((todo) => todo.id !== id),
      };
    });
  };

  return (
    <div className="screen active" id="screenTodo">
      <TopBar />
      <div className="screen-header">
   <span>📅 일정 관리</span>
        <span className="section-badge">{completedCount}/{selectedTodos.length}</span>
      </div>

      <div style={{ padding: '12px 12px 8px' }}>
        <div
          style={{
            border: '3px solid var(--border)',
            borderRadius: 12,
            background: 'var(--bg-card2)',
            padding: 10,
            boxShadow: '2px 2px 0 var(--border2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            <span>📆 {calendarMeta.title}</span>
            <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>일정 있는 날짜는 강조</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
              marginBottom: 6,
              fontSize: 10,
              color: 'var(--text-sub)',
              textAlign: 'center',
            }}
          >
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} style={{ padding: '4px 0' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calendarMeta.cells.map((dateKey, idx) => {
              if (!dateKey) {
                return <div key={`empty-${idx}`} style={{ height: 34 }} />;
              }

              const day = Number(dateKey.split('-')[2]);
              const hasTodos = (todoByDate[dateKey] ?? []).length > 0;
              const isSelected = selectedDate === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  style={{
                    height: 34,
                    borderRadius: 8,
                    border: `2px solid ${isSelected ? 'var(--accent3)' : 'var(--border2)'}`,
                    background: isSelected
                      ? 'linear-gradient(180deg, var(--accent2), var(--accent))'
                      : hasTodos
                        ? 'linear-gradient(180deg, #fff7dd, #ffefbd)'
                        : 'var(--bg-card)',
                    color: isSelected ? 'white' : 'var(--text-main)',
                    fontSize: 11,
                    fontWeight: hasTodos || isSelected ? 700 : 500,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {day}
                  {hasTodos && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 4,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: isSelected ? 'white' : 'var(--accent3)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 12px 8px', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="game-input"
          placeholder={`${formatDateLabel(selectedDate)} 일정 추가`}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTodo();
          }}
          style={{ border: '2px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}
        />
        <button type="button" className="btn-primary small" onClick={handleAddTodo}>
          추가
        </button>
      </div>

      <div className="section-header" style={{ paddingTop: 0 }}>
        <span className="section-icon">🗂️</span>
        <span>{formatDateLabel(selectedDate)} 일정</span>
      </div>

      <div className="quest-list" style={{ paddingBottom: 12 }}>
        {selectedTodos.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '20px 0' }}>
            등록된 일정이 없습니다.
          </div>
        ) : (
          selectedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`quest-item ${todo.done ? 'done' : ''}`}
              onClick={() => handleToggleTodo(todo.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleToggleTodo(todo.id);
              }}
            >
              <div className={`quest-check ${todo.done ? '' : 'empty'}`}>{todo.done ? '✓' : '○'}</div>
              <div className="quest-info">
                <div className="quest-name">{todo.text}</div>
                <div className="quest-reward">
                  {todo.category} · {todo.source === 'academic' ? '학사 크롤링' : '직접 추가'}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTodo(todo.id);
                }}
                style={{
                  border: '2px solid var(--border)',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: 11,
                  color: 'var(--text-sub)',
                  background: 'var(--bg-card2)',
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TodoPage;
