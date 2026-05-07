import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import '../styles/RouteLoadingOverlay.css';

const TITLE_BANNER_SRC = '/images/campus-rpg-title-banner.png';
const LOGIN_LOADING_MS = 3000;
const LOGIN_LOADING_FADE_MS = 320;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loadingPhase, setLoadingPhase] = useState('hidden'); // hidden | entering | shown | fading
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current = [];
    };
  }, []);

  const startLoginTransition = () => {
    if (loadingPhase !== 'hidden') return;

    setLoadingPhase('entering');
    timersRef.current = [
      setTimeout(() => setLoadingPhase('shown'), 0),
      // Fade in completes first, then switch route while overlay is still active.
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

            <form
              className="login-panel__form"
              onSubmit={(e) => {
                e.preventDefault();
                startLoginTransition();
              }}
            >
              <label className="login-field">
                <span className="login-field__label">학번 또는 이메일</span>
                <input
                  type="text"
                  name="id"
                  autoComplete="username"
                  placeholder="campus@school.ac.kr"
                  className="login-field__input"
                />
              </label>

              <label className="login-field">
                <span className="login-field__label">비밀번호</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="login-field__input"
                />
              </label>

              <button
                type="submit"
                className="login-btn login-btn--primary"
                disabled={loadingPhase !== 'hidden'}
              >
                모험 시작!
              </button>
            </form>

            <button
              type="button"
              className="login-btn login-btn--secondary"
              onClick={() => navigate('/signup')}
            >
              새 알 부화하기
            </button>
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
