import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEV_MOCK_TOKEN, TOKEN_KEY } from '../constants/authStorage';
import { isDevMockAuthEnabled } from '../utils/devAuth';
import { apiUrl } from '../api/apiBase';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';
import '../styles/RouteLoadingOverlay.css';

const TITLE_BANNER_SRC = '/images/campus-rpg-title-banner.png';
const LOGIN_LOADING_FADE_MS = 320;

const LoginPage = () => {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('hidden');
  const timersRef = useRef([]);

  useEffect(() => {
    document.body.classList.add('login-route-bg');
    return () => {
      document.body.classList.remove('login-route-bg');
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current = [];
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || loadingPhase !== 'hidden') return;
    setError('');

    const id = loginId.trim();
    if (!id || !password) {
      setError('이메일(또는 학번)과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      setLoadingPhase('entering');
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: id, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        setLoadingPhase('hidden');
        return;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      await refreshMe();
      timersRef.current = [
        setTimeout(() => setLoadingPhase('shown'), 0),
        setTimeout(
          () =>
            navigate('/home', {
              state: {
                loginLoadingTransition: true,
                loginLoadingStartedAt: Date.now(),
              },
            }),
          LOGIN_LOADING_FADE_MS
        ),
      ];
    } catch {
      setError('네트워크 오류입니다. 백엔드가 켜져 있는지 확인해 주세요.');
      setLoadingPhase('hidden');
    } finally {
      setLoading(false);
    }
  };

  const handleDevMockLogin = async () => {
    if (!isDevMockAuthEnabled() || loading || loadingPhase !== 'hidden') return;
    setError('');
    setLoadingPhase('entering');
    localStorage.setItem(TOKEN_KEY, DEV_MOCK_TOKEN);
    await refreshMe();
    timersRef.current = [
      setTimeout(() => setLoadingPhase('shown'), 0),
      setTimeout(
        () =>
          navigate('/home', {
            state: {
              loginLoadingTransition: true,
              loginLoadingStartedAt: Date.now(),
            },
          }),
        LOGIN_LOADING_FADE_MS
      ),
    ];
  };

  const loadingClassName = [
    'route-loading-overlay',
    loadingPhase === 'entering' ? 'route-loading-overlay--entering' : '',
    loadingPhase === 'shown' ? 'route-loading-overlay--shown' : '',
    loadingPhase === 'fading' ? 'route-loading-overlay--fading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className="login-page">
        <div className="login-page__stack">
          <header className="login-page__hero">
            <img
              src={TITLE_BANNER_SRC}
              alt="캠퍼스 RPG — 매일 성장하는 대학 생활"
              className="login-page__title-img"
              decoding="async"
            />
          </header>

          <main className="login-page__main">
            <section className="login-panel" aria-labelledby="login-form-title">
              <h1 id="login-form-title" className="login-panel__menu-title">
                로그인
              </h1>

              <form className="login-panel__form" onSubmit={handleSubmit} autoComplete="on">
                <label className="login-field">
                  <span className="login-field__label">학번 또는 이메일</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="campus@school.ac.kr"
                    className="login-field__input"
                    autoComplete="username"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </label>
                <label className="login-field">
                  <span className="login-field__label">비밀번호</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="login-field__input"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                {error ? <p className="login-error">{error}</p> : null}
                <button
                  type="submit"
                  className="login-btn login-btn--primary"
                  disabled={loading || loadingPhase !== 'hidden'}
                >
                  {loading ? '확인 중…' : '모험 시작!'}
                </button>
              </form>
              <button type="button" className="login-btn login-btn--secondary" onClick={() => navigate('/signup')}>
                새 알 부화하기
              </button>
              {isDevMockAuthEnabled() ? (
                <>
                  <p className="login-dev-hint">백엔드·DB 없이 UI만 볼 때</p>
                  <button
                    type="button"
                    className="login-btn login-btn--dev"
                    onClick={() => void handleDevMockLogin()}
                    disabled={loading || loadingPhase !== 'hidden'}
                  >
                    개발용 바로 입장
                  </button>
                </>
              ) : null}
            </section>
          </main>
        </div>
      </div>
      {loadingPhase !== 'hidden' && (
        <div className={loadingClassName} aria-live="polite" aria-label="Loading">
          <div className="route-loading-overlay__content">
            <div className="route-loading-overlay__spinner" aria-hidden="true" />
            <div className="route-loading-overlay__text">Loading..</div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
