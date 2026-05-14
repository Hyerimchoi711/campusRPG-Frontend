import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useGameUser } from '../context/GameUserContext';
import { TOKEN_KEY } from '../constants/authStorage';
import { claimTodoCompletionBonus } from '../api/todoRewardClient';
import '../styles/TodoPage.css';

const TODO_STORAGE_KEY = 'campusRpg_todoByDate';

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

function normalizeTodoByDate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [dateKey, list] of Object.entries(raw)) {
    if (!Array.isArray(list)) continue;
    out[dateKey] = list.map((t) => {
      if (!t || typeof t !== 'object') return t;
      return {
        ...t,
        completionBonusClaimed: Boolean(t.completionBonusClaimed),
      };
    });
  }
  return out;
}

function loadTodoByDateFromStorage() {
  try {
    const raw = localStorage.getItem(TODO_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return normalizeTodoByDate(parsed);
  } catch {
    return {};
  }
}

// 특정 날짜가 속한 달의 몇 주차인지 계산하는 함수
const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 (일) ~ 6 (토)
  const offsetDate = date.getDate() + firstDayWeekday - 1;
  return Math.floor(offsetDate / 7) + 1;
};

const TodoPage = () => {
  const { refreshMe } = useAuth();
  const { refreshWallet } = useGameUser();

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  // 주간 뷰의 기준이 되는 날짜 (해당 날짜가 속한 주를 보여줌)
  const [currentWeekDate, setCurrentWeekDate] = useState(() => new Date());

  const [newTodo, setNewTodo] = useState('');
  const [todoByDate, setTodoByDate] = useState(() => loadTodoByDateFromStorage());

  const [toast, setToast] = useState(null);

  const todoByDateRef = useRef(todoByDate);
  const selectedDateRef = useRef(selectedDate);

  useEffect(() => {
    todoByDateRef.current = todoByDate;
  }, [todoByDate]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoByDate));
    } catch {
      /* ignore */
    }
  }, [todoByDate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message, variant = 'info') => {
    setToast({ message, variant });
  }, []);

  const calendarMeta = useMemo(() => {
    const year = currentWeekDate.getFullYear();
    const monthIndex = currentWeekDate.getMonth();
    const weekNumber = getWeekOfMonth(currentWeekDate);

    // 현재 기준일의 요일 (0: 일요일 ~ 6: 토요일)
    const dayOfWeek = currentWeekDate.getDay();

    // 이번 주의 일요일 날짜 계산
    const sunday = new Date(currentWeekDate);
    sunday.setDate(currentWeekDate.getDate() - dayOfWeek);

    const cells = [];

    // 일요일부터 토요일까지 7일간의 날짜 생성
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      cells.push(toDateKey(date));
    }

    return {
      title: `${year}년 ${monthIndex + 1}월 ${weekNumber}주차`,
      cells,
      year,
      monthIndex,
    };
  }, [currentWeekDate]);

  const todayKey = toDateKey(new Date());

  const handlePrevWeek = () => {
    setCurrentWeekDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const selectedTodos = useMemo(() => todoByDate[selectedDate] ?? [], [todoByDate, selectedDate]);

  const handleAddTodo = () => {
    const value = newTodo.trim();
    if (!value) return;

    setTodoByDate((prev) => {
      const currentTodos = prev[selectedDate] ?? [];
      return {
        ...prev,
        [selectedDate]: [
          ...currentTodos,
          {
            id: Date.now(),
            text: value,
            done: false,
            category: '개인',
            source: 'manual',
            completionBonusClaimed: false,
          },
        ],
      };
    });
    setNewTodo('');
  };

  const setTodoDoneForDate = useCallback((dateKey, id, patch) => {
    setTodoByDate((prev) => {
      const currentTodos = prev[dateKey] ?? [];
      return {
        ...prev,
        [dateKey]: currentTodos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)),
      };
    });
  }, []);

  const handleToggleTodo = async (id) => {
    const dateKey = selectedDateRef.current;
    const prev = todoByDateRef.current;
    const currentTodos = prev[dateKey] ?? [];
    const todo = currentTodos.find((t) => t.id === id);
    if (!todo) return;

    const nextDone = !todo.done;

    if (!nextDone) {
      setTodoDoneForDate(dateKey, id, { done: false });
      return;
    }

    const isToday = dateKey === toDateKey(new Date());
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    if (!isToday || todo.completionBonusClaimed) {
      setTodoDoneForDate(dateKey, id, { done: true });
      return;
    }

    if (!token) {
      setTodoDoneForDate(dateKey, id, { done: true });
      showToast('로그인하면 오늘 일정 완료 시 코인을 받을 수 있어요.', 'info');
      return;
    }

    try {
      const res = await claimTodoCompletionBonus({ dateKey, clientTodoId: id });
      setTodoDoneForDate(dateKey, id, { done: true, completionBonusClaimed: true });
      await refreshWallet();
      await refreshMe();
      if (res.awarded) {
        showToast('일정 완료! 코인 +100', 'success');
      } else {
        showToast('이미 지급된 보상이에요.', 'info');
      }
    } catch {
      setTodoDoneForDate(dateKey, id, { done: true });
      showToast('코인 지급에 실패했어요. 나중에 다시 완료해 보세요.', 'error');
    }
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

  const showRewardHint =
    selectedDate === todayKey &&
    selectedTodos.some((t) => !t.done && !t.completionBonusClaimed);

  return (
    <div className="screen active" id="screenTodo">
      <TopBar />

      {toast && (
        <div className="todo-toast-wrap" role="status" aria-live="polite">
          <div className={`todo-toast ${toast.variant}`}>{toast.message}</div>
        </div>
      )}

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
            <button
              type="button"
              onClick={handlePrevWeek}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--text-main)',
                padding: '0 8px',
              }}
            >
              ◀
            </button>
            <span>📆 {calendarMeta.title}</span>
            <button
              type="button"
              onClick={handleNextWeek}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--text-main)',
                padding: '0 8px',
              }}
            >
              ▶
            </button>
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
              <div key={day} style={{ padding: '4px 0' }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calendarMeta.cells.map((dateKey) => {
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

      <div className="section-header" style={{ paddingTop: 0 }}>
        <span className="section-icon">🗂️</span>
        <span>{formatDateLabel(selectedDate)} 일정</span>
      </div>

      {showRewardHint && (
        <div className="todo-reward-hint">오늘 일정을 처음 완료하면 코인 +100 (항목당 1회)</div>
      )}

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
              onClick={() => void handleToggleTodo(todo.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') void handleToggleTodo(todo.id);
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

      <div style={{ padding: '8px 12px 8px', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="game-input"
          placeholder={`${formatDateLabel(selectedDate)} 일정 추가`}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') handleAddTodo();
          }}
          style={{ border: '2px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}
        />
        <button type="button" className="btn-primary small" onClick={handleAddTodo}>
          추가
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default TodoPage;
