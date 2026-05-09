import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api/apiBase';
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';

const TITLE_BANNER_SRC = '/images/campus-rpg-title-banner.png';

const initialForm = {
  email: '',
  password: '',
  nickname: '',
  student_id: '',
  major: '',
  university_name: '',
  school_year: '',
  age: '',
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('login-route-bg');
    return () => {
      document.body.classList.remove('login-route-bg');
    };
  }, []);

  const setField = (key) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ageNum = parseInt(String(form.age).trim(), 10);
      const schoolYearNum = parseInt(String(form.school_year).trim(), 10);
      if (!Number.isFinite(schoolYearNum) || schoolYearNum < 1 || schoolYearNum > 4) {
        setError('학년은 1~4 사이 숫자로 입력해 주세요.');
        return;
      }
      if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
        setError('나이를 올바르게 입력해 주세요.');
        return;
      }
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          nickname: form.nickname.trim(),
          student_id: form.student_id.trim(),
          major: form.major.trim(),
          university_name: form.university_name.trim(),
          school_year: schoolYearNum,
          age: ageNum,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '가입에 실패했습니다.');
        return;
      }
      navigate('/login');
    } catch {
      setError('네트워크 오류입니다. 백엔드와 프록시를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <p className="signup-page__sub">회원가입</p>
            <form className="login-panel__form" onSubmit={handleRegister} autoComplete="off">
          {error ? <p className="signup-error">{error}</p> : null}
          <label className="login-field">
            <span className="login-field__label">이메일</span>
            <input
              type="email"
              name="email"
              placeholder="campus@school.ac.kr"
              className="login-field__input"
              autoComplete="username"
              value={form.email}
              onChange={setField('email')}
              required
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">학번</span>
            <input
              type="text"
              name="student_id"
              placeholder="학번"
              className="login-field__input"
              autoComplete="off"
              value={form.student_id}
              onChange={setField('student_id')}
              required
              maxLength={30}
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">비밀번호</span>
            <input
              type="password"
              name="new-password"
              placeholder="••••••••"
              className="login-field__input"
              autoComplete="new-password"
              value={form.password}
              onChange={setField('password')}
              required
              minLength={8}
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">닉네임</span>
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              className="login-field__input"
              autoComplete="nickname"
              value={form.nickname}
              onChange={setField('nickname')}
              required
              maxLength={50}
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">학과</span>
            <input
              type="text"
              name="major"
              placeholder="학과"
              className="login-field__input"
              autoComplete="off"
              value={form.major}
              onChange={setField('major')}
              required
              maxLength={80}
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">대학교</span>
            <input
              type="text"
              name="university_name"
              placeholder="대학교 이름(예시: 00대학교)"
              className="login-field__input"
              autoComplete="organization"
              value={form.university_name}
              onChange={setField('university_name')}
              required
              maxLength={120}
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">학년 (1~4)</span>
            <input
              type="number"
              name="school_year"
              placeholder="학년 (1~4)"
              className="login-field__input"
              autoComplete="off"
              min={1}
              max={6}
              value={form.school_year}
              onChange={setField('school_year')}
              required
            />
          </label>
          <label className="login-field">
            <span className="login-field__label">나이</span>
            <input
              type="number"
              name="age"
              placeholder="나이"
              className="login-field__input"
              autoComplete="off"
              min={1}
              max={120}
              value={form.age}
              onChange={setField('age')}
              required
            />
          </label>
          <button type="submit" className="login-btn login-btn--primary" disabled={submitting}>
            {submitting ? '처리 중…' : '가입하고 알 부화하기'}
          </button>
        </form>
            <button type="button" className="login-btn login-btn--secondary" onClick={() => navigate('/login')}>
              이미 계정이 있어요 — 로그인
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SignupPage;
