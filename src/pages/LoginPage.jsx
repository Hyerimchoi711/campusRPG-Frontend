import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const TITLE_BANNER_SRC = '/images/campus-rpg-title-banner.png';

const LoginPage = () => {
  const navigate = useNavigate();

  return (
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
                navigate('/home');
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

              <button type="submit" className="login-btn login-btn--primary">
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
  );
};

export default LoginPage;
