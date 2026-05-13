import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

/**
 * 개발 서버 전용: Vite 인메모리 퀘스트 스텁 on/off (`/__dev/quest-stub`).
 * 프로덕션 빌드에는 라우트가 없습니다.
 */
export default function DevQuestStubPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({ enabled: true, envLocked: false, error: '' });

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/__dev/quest-stub', { headers: { Accept: 'application/json' } });
      const j = await r.json();
      setState((s) => ({ ...s, enabled: Boolean(j.enabled), envLocked: Boolean(j.envLocked), error: '' }));
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || '상태를 불러오지 못했어요.' }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setEnabled = async (enabled) => {
    setState((s) => ({ ...s, error: '' }));
    try {
      const r = await fetch('/__dev/quest-stub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || '설정 실패');
      setState((s) => ({ ...s, enabled: Boolean(j.enabled), envLocked: Boolean(j.envLocked) }));
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || '설정하지 못했어요.' }));
    }
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="screen active" id="screenDevQuestStub">
      <TopBar />
      <div style={{ padding: 16, fontSize: 13, lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 16, margin: '0 0 12px' }}>퀘스트 스텁 (개발)</h1>
        <p style={{ margin: '0 0 12px', color: '#555' }}>
          켜져 있으면 <code>/api/me/quests/*</code>가 Vite 인메모리 스텁으로 처리됩니다.
          끄면 프록시된 실제 백엔드로 요청이 전달됩니다.
        </p>
        {state.envLocked ? (
          <p style={{ color: '#a60' }}>
            환경 변수 <code>VITE_EMBEDDED_QUEST_STUB=false</code>로 스텁이 비활성화되어 있습니다. 런타임 토글은 적용되지 않습니다.
          </p>
        ) : null}
        <p style={{ margin: '12px 0' }}>
          현재: <strong>{state.enabled ? '스텁 ON' : '스텁 OFF (실백엔드)'}</strong>
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setEnabled(true)} disabled={state.envLocked}>
            스텁 켜기
          </button>
          <button type="button" onClick={() => setEnabled(false)} disabled={state.envLocked}>
            스텁 끄기
          </button>
          <button type="button" onClick={() => refresh()}>
            새로고침
          </button>
          <button type="button" onClick={() => navigate('/home')}>
            홈으로
          </button>
        </div>
        {state.error ? <p style={{ color: '#c00', marginTop: 12 }}>{state.error}</p> : null}
      </div>
      <BottomNav />
    </div>
  );
}
