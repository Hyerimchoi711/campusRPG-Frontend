import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api/apiBase';
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';

const initialForm = {
  email: '',
  password: '',
  nickname: '',
  student_id: '',
  major: '',
  university_name: '',
  age: '',
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    <div className="screen active" id="screenSignup">
      <div className="login-bg" />
      <div className="login-content signup-content">
        <button
          type="button"
          className="signup-back"
          onClick={() => navigate('/login')}
        >
          ← 로그인으로
        </button>

        <div className="game-logo">
          <div className="logo-sub">CampusQuest 회원가입</div>
        </div>

        <div className="signup-divider">
          <span>이메일로 가입</span>
        </div>

        <form className="login-form" onSubmit={handleRegister} autoComplete="off">
          {error ? <p className="signup-error">{error}</p> : null}
          <p className="signup-field-hint">
            브라우저가 학번 칸에 비밀번호를 자동으로 넣을 수 있습니다. 학번은 직접 확인해 주세요.
          </p>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              className="game-input"
              autoComplete="username"
              value={form.email}
              onChange={setField('email')}
              required
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🎓</span>
            <input
              type="text"
              name="student_id"
              placeholder="학번"
              className="game-input"
              autoComplete="off"
              value={form.student_id}
              onChange={setField('student_id')}
              required
              maxLength={30}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔑</span>
            <input
              type="password"
              name="new-password"
              placeholder="비밀번호 (8자 이상)"
              className="game-input"
              autoComplete="new-password"
              value={form.password}
              onChange={setField('password')}
              required
              minLength={8}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">✨</span>
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              className="game-input"
              autoComplete="nickname"
              value={form.nickname}
              onChange={setField('nickname')}
              required
              maxLength={50}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">📚</span>
            <input
              type="text"
              name="major"
              placeholder="학과"
              className="game-input"
              autoComplete="off"
              value={form.major}
              onChange={setField('major')}
              required
              maxLength={80}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🏛️</span>
            <input
              type="text"
              name="university_name"
              placeholder="대학교 이름"
              className="game-input"
              autoComplete="organization"
              value={form.university_name}
              onChange={setField('university_name')}
              required
              maxLength={120}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🎂</span>
            <input
              type="number"
              name="age"
              placeholder="나이"
              className="game-input"
              autoComplete="off"
              min={1}
              max={120}
              value={form.age}
              onChange={setField('age')}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <span>{submitting ? '처리 중…' : '가입 완료'}</span>
            <div className="btn-shine" />
          </button>
        </form>

        <p className="signup-hint">
          카카오 로그인은 앱 승인 후 연결 예정입니다. 아래 정보로 계정을 만듭니다.
        </p>

        <div className="signup-kakao-block">
          <button type="button" className="btn-kakao" disabled title="카카오 개발자 앱 승인 후 연결">
            <span className="btn-kakao-icon" aria-hidden="true">
              카
            </span>
            카카오로 시작하기
          </button>
          <span className="signup-kakao-note">준비 중 · 승인 후 활성화</span>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
