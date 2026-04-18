import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_KEY } from '../constants/authStorage';
import { apiUrl } from '../api/apiBase';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const id = loginId.trim();
    if (!id || !password) {
      setError('이메일(또는 학번)과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: id, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        return;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      await refreshMe();
      navigate('/home');
    } catch {
      setError('네트워크 오류입니다. 백엔드가 켜져 있는지 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" id="screenLogin">
      <div className="login-bg"></div>
      <div className="login-content">
        <div className="game-logo">
          <div className="logo-pixel">CQ</div>
          <div className="logo-title">CampusQuest</div>
          <div className="logo-sub">나의 대학생활을 RPG로</div>
        </div>
        <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
          {error ? <p className="login-error">{error}</p> : null}
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              name="username"
              placeholder="학번 또는 이메일"
              className="game-input"
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔑</span>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              className="game-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <span>{loading ? '확인 중…' : '모험 시작!'}</span>
            <div className="btn-shine"></div>
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/signup')}>
            새 알 부화하기
          </button>
        </form>
        <div className="login-deco">
          <div className="pixel-char char-idle" id="loginChar">🥚</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
