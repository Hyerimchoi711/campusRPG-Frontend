import React, { useState, useMemo } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import TypewriterSpeech from '../components/TypewriterSpeech';
import { useProfile } from '../context/ProfileContext';
import { useQuests } from '../context/QuestContext';
import { generateQuestsFromLLM } from '../api/generateQuests';
import '../styles/QuestsPage.css';

const QUEST_NPC_SPEECH_LINES = [
  { text: '학과와 학년을 알려주면, 오늘의 길잡이를 짜 주지.' },
  {
    text: '프로필 정보로 맞춤 일일·주간 퀘스트를 만든다네.',
    className: 'quest-npc-speech-bubble-sub',
  },
];

const QuestsPage = () => {
  const { profile } = useProfile();
  const {
    dailyQuests,
    weeklyQuests,
    questSource,
    questGeneratedAt,
    setQuestsFromLLM,
    resetToDefault,
    toggleDaily,
    toggleWeekly,
  } = useQuests();

  const [isDailyOpen, setIsDailyOpen] = useState(true);
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majorOk = Boolean(profile.major?.toString().trim());
  const yearOk = Boolean(profile.schoolYear?.toString().trim());
  const canGenerate = majorOk && yearOk;

  const dailyBadge = useMemo(() => {
    const done = dailyQuests.filter((q) => q.done).length;
    return `${done}/${dailyQuests.length}`;
  }, [dailyQuests]);

  const weeklyBadge = useMemo(() => {
    const done = weeklyQuests.filter((q) => q.done).length;
    return `${done}/${weeklyQuests.length}`;
  }, [weeklyQuests]);

  const handleGenerate = async () => {
    setError('');
    if (!canGenerate) {
      setError('프로필에서 학과·학년을 먼저 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await generateQuestsFromLLM({
        major: profile.major,
        schoolYear: profile.schoolYear,
        university: profile.university,
        realName: profile.realName,
      });
      setQuestsFromLLM(data);
    } catch (e) {
      setError(e.message || '퀘스트를 받아오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const formatGenAt = () => {
    if (!questGeneratedAt) return null;
    try {
      const d = new Date(questGeneratedAt);
      return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  return (
    <div className="screen active" id="screenQuests">
      <TopBar />

      <div className="quests-content-wrapper">
        {/* 퀘스트 NPC: 일러스트 전체 배경 + 그 위 말풍선·버튼 (상점 헤더와 동일 패턴) */}
        <div className="quest-npc-header" role="region" aria-label="퀘스트 안내 NPC">
          <video
            className="quest-npc-header-bg-video"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
          >
            <source src="/images/quest/quest_npc.mp4" type="video/mp4" />
          </video>
          <div className="quest-npc-header-overlay" aria-hidden />
          <div className="quest-npc-speech-bubble" aria-live="polite">
            <TypewriterSpeech lines={QUEST_NPC_SPEECH_LINES} charMs={30} linePauseMs={420} />
          </div>
          <div className="quest-npc-header-bottom">
            <div className="quest-npc-actions">
              <button
                type="button"
                className="quest-npc-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? '생성 중…' : '맞춤 퀘스트 받기'}
              </button>
              <button type="button" className="quest-npc-btn quest-npc-btn--ghost" onClick={() => resetToDefault()} disabled={loading}>
                기본 퀘스트로
              </button>
            </div>
            {!canGenerate && (
              <p className="quest-npc-warn">⚠️ 내 프로필 → 상세 정보에서 <strong>학과</strong>와 <strong>학년</strong>을 적어 주세요.</p>
            )}
            {error && <p className="quest-npc-error">{error}</p>}
            {questSource === 'llm' && questGeneratedAt && (
              <p className="quest-npc-meta">AI 생성 · {formatGenAt()}</p>
            )}
          </div>
        </div>

        <div className="section-header" onClick={() => setIsDailyOpen(!isDailyOpen)}>
          <span className="section-icon">📋</span>
          <span>일일 퀘스트</span>
          <span className="section-toggle">{isDailyOpen ? '▲' : '▼'}</span>
          <span className="section-badge">{dailyBadge}</span>
        </div>

        {isDailyOpen && (
          <div className="quest-list daily">
            {dailyQuests.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`quest-item quest-item--btn ${q.done ? 'done' : ''} ${!q.done ? 'active' : ''}`}
                onClick={() => toggleDaily(q.id)}
              >
                <div className="quest-check">{q.done ? '✓' : '○'}</div>
                <div className="quest-info">
                  <div className="quest-name">{q.title}</div>
                  <div className="quest-reward">{q.reward}</div>
                </div>
                <div className={`quest-xp ${q.done ? 'done-badge' : ''}`}>{q.done ? '완료' : '탭하여 완료'}</div>
              </button>
            ))}
          </div>
        )}

        <div className="section-header" onClick={() => setIsWeeklyOpen(!isWeeklyOpen)}>
          <span className="section-icon">📅</span>
          <span>주간 퀘스트</span>
          <span className="section-toggle">{isWeeklyOpen ? '▲' : '▼'}</span>
          <span className="section-badge">{weeklyBadge}</span>
        </div>

        {isWeeklyOpen && (
          <div className="quest-list weekly">
            {weeklyQuests.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`quest-item quest-item--btn ${q.done ? 'done' : ''}`}
                onClick={() => toggleWeekly(q.id)}
              >
                <div className="quest-check">{q.done ? '✓' : '○'}</div>
                <div className="quest-info">
                  <div className="quest-name">{q.title}</div>
                  <div className="quest-reward">{q.reward}</div>
                </div>
                <div className={`quest-xp ${q.done ? 'done-badge' : ''}`}>{q.done ? '완료' : '탭하여 완료'}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default QuestsPage;
