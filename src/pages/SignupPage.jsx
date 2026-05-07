import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/registerUser';
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';

const TITLE_BANNER_SRC = '/images/campus-rpg-title-banner.png';

const SignupPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  return (
    <div className="login-page login-page--scrollable signup-page">
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
          <section className="login-panel" aria-labelledby="signup-form-title">
            <h1 id="signup-form-title" className="login-panel__menu-title">
              새 알 부화하기
            </h1>
            <p className="signup-page__sub">회원가입 (필드는 명세 확정 후 조정 가능)</p>

            <form
              className="login-panel__form"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError('');
                const fd = new FormData(e.currentTarget);
                const studentIdOrEmail = (fd.get('studentIdOrEmail') ?? '').toString().trim();
                const nickname = (fd.get('nickname') ?? '').toString().trim();
                const password = (fd.get('password') ?? '').toString();
                const passwordConfirm = (fd.get('passwordConfirm') ?? '').toString();

                if (!studentIdOrEmail || !nickname || !password) {
                  setFormError('필수 항목을 모두 입력해 주세요.');
                  return;
                }
                if (password !== passwordConfirm) {
                  setFormError('비밀번호가 서로 다릅니다.');
                  return;
                }

                setSubmitting(true);
                try {
                  const result = await registerUser({
                    studentIdOrEmail,
                    nickname,
                    password,
                  });
                  if (result.ok) {
                    navigate('/login', { replace: false });
                    return;
                  }
                  setFormError(result.message ?? '가입에 실패했습니다.');
                } catch {
                  setFormError('요청 중 오류가 발생했습니다.');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <label className="login-field">
                <span className="login-field__label">학번 또는 이메일</span>
                <input
                  name="studentIdOrEmail"
                  type="text"
                  autoComplete="username"
                  className="login-field__input"
                  placeholder="campus@school.ac.kr"
                  disabled={submitting}
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-field__label">닉네임</span>
                <input
                  name="nickname"
                  type="text"
                  autoComplete="nickname"
                  className="login-field__input"
                  placeholder="알에서 쓸 이름"
                  maxLength={40}
                  disabled={submitting}
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-field__label">비밀번호</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="login-field__input"
                  placeholder="••••••••"
                  minLength={4}
                  disabled={submitting}
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-field__label">비밀번호 확인</span>
                <input
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  className="login-field__input"
                  placeholder="••••••••"
                  minLength={4}
                  disabled={submitting}
                  required
                />
              </label>

              {formError ? (
                <p className="signup-page__error" role="alert">
                  {formError}
                </p>
              ) : null}

              <button type="submit" className="login-btn login-btn--primary" disabled={submitting}>
                {submitting ? '처리 중…' : '가입하고 알 부화하기'}
              </button>
            </form>

            <Link to="/login" className="signup-page__back-link">
              이미 계정이 있어요 — 로그인
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SignupPage;
