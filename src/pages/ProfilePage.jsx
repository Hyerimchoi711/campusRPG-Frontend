import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { fetchUserPublicProfile } from '../api/friendsClient';
import '../styles/ProfilePage.css';

const AVATAR_OPTIONS = ['🥚', '🧑‍🎓', '👩‍🎓', '🦉', '📚', '🌱', '⭐', '🎮'];

const MAX_LEN = {
  intro: 160,
};

/** 회원 정보 표시용 (/api/me.user + 로드 전 프로필 폴백) */
function useAccountFields(me, profile, isFriendView) {
  return useMemo(() => {
    if (isFriendView) return null;
    const u = me?.user;
    const nickname = u?.nickname?.trim() || profile.realName?.trim() || '';
    const university = u?.universityName || u?.university_name || profile.university || '';
    const major = u?.major || profile.major || '';
    const schoolYearRaw =
      u?.schoolYear != null && String(u.schoolYear).trim() !== ''
        ? String(u.schoolYear).trim()
        : u?.school_year != null && String(u.school_year).trim() !== ''
          ? String(u.school_year).trim()
          : profile.schoolYear || '';
    const ageRaw = u?.age != null ? String(u.age) : profile.age || '';
    return {
      nickname: nickname || '',
      university,
      major,
      schoolYear: schoolYearRaw,
      age: ageRaw,
    };
  }, [me, profile, isFriendView]);
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id: friendRouteId } = useParams();
  const isFriendView = Boolean(friendRouteId);

  const { me, refreshMe } = useAuth();
  const { profile, setProfile } = useProfile();
  const accountFields = useAccountFields(me, profile, isFriendView);

  const [editingIntro, setEditingIntro] = useState(false);
  const [draftIntro, setDraftIntro] = useState('');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(AVATAR_OPTIONS[0]);
  const introRef = useRef(null);

  const [friendLoad, setFriendLoad] = useState({
    status: /** @type {'idle' | 'loading' | 'ok' | 'error'} */ ('idle'),
    error: '',
    publicProfile: null,
  });
  const [copyHint, setCopyHint] = useState('');

  const friendDisplayProfile = useMemo(() => {
    const p = friendLoad.publicProfile;
    if (!p || !p.userId) return null;
    return {
      realName: p.nickname,
      university: p.university,
      major: p.major,
      schoolYear: p.schoolYear,
      age: p.age,
      intro: p.intro,
      avatar: p.avatar,
    };
  }, [friendLoad.publicProfile]);

  const displayProfile = isFriendView ? friendDisplayProfile : profile;

  const myFriendCode = useMemo(() => {
    const u = me?.user;
    const raw = u?.friendCode ?? u?.friend_code;
    return raw != null && String(raw).trim() !== '' ? String(raw).trim() : '';
  }, [me]);

  const visibleFriendCode = isFriendView
    ? String(friendLoad.publicProfile?.friendCode ?? '').trim()
    : myFriendCode;

  useEffect(() => {
    if (!isFriendView) {
      refreshMe();
    }
  }, [isFriendView, refreshMe]);

  useEffect(() => {
    if (!isFriendView || !friendRouteId) {
      setFriendLoad({ status: 'idle', error: '', publicProfile: null });
      return undefined;
    }
    let cancelled = false;
    setFriendLoad({ status: 'loading', error: '', publicProfile: null });
    fetchUserPublicProfile(friendRouteId)
      .then((p) => {
        if (cancelled) return;
        if (!p?.userId) {
          setFriendLoad({ status: 'error', error: '프로필을 불러올 수 없어요.', publicProfile: null });
        } else {
          setFriendLoad({ status: 'ok', error: '', publicProfile: p });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e?.data?.message || e?.message || '프로필을 불러오지 못했어요.';
        setFriendLoad({ status: 'error', error: String(msg), publicProfile: null });
      });
    return () => {
      cancelled = true;
    };
  }, [isFriendView, friendRouteId]);

  useEffect(() => {
    setEditingIntro(false);
    setDraftIntro('');
    setAvatarModalOpen(false);
  }, [friendRouteId]);

  useEffect(() => {
    if (editingIntro && introRef.current) {
      introRef.current.focus();
    }
  }, [editingIntro]);

  useEffect(() => {
    if (!avatarModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setAvatarModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [avatarModalOpen]);

  const goBack = () => navigate(-1);

  const copyFriendCode = useCallback(async () => {
    if (!visibleFriendCode) return;
    try {
      await navigator.clipboard.writeText(visibleFriendCode);
      setCopyHint('복사했어요');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = visibleFriendCode;
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyHint('복사했어요');
      } catch {
        setCopyHint('복사에 실패했어요');
      }
    }
    window.setTimeout(() => setCopyHint(''), 2000);
  }, [visibleFriendCode]);

  /* 첫 페인트에서 status가 'idle'이면 본문이 렌더되며 displayProfile이 null → readonly 행에서 크래시 방지 */
  if (isFriendView && (friendLoad.status === 'loading' || friendLoad.status === 'idle')) {
    return (
      <div className="screen active" id="screenProfile">
        <TopBar />
        <div className="screen-header">
          <button type="button" className="back-btn" onClick={goBack} aria-label="뒤로">
            ←
          </button>
          <span>친구 프로필</span>
        </div>
        <div className="profile-page-scroll profile-simple-scroll">
          <p className="profile-friend-loading">프로필을 불러오는 중…</p>
        </div>
      </div>
    );
  }

  if (isFriendView && friendLoad.status === 'error') {
    return (
      <div className="screen active" id="screenProfile">
        <TopBar />
        <div className="screen-header">
          <button type="button" className="back-btn" onClick={goBack} aria-label="뒤로">
            ←
          </button>
          <span>친구 프로필</span>
        </div>
        <div className="profile-page-scroll profile-simple-scroll">
          <div className="profile-friend-missing">
            <p className="profile-friend-missing-text">{friendLoad.error}</p>
            <button type="button" className="profile-simple-avatar-btn" onClick={() => navigate('/friends')}>
              친구 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = isFriendView
    ? displayProfile?.realName?.trim() || '이름'
    : accountFields?.nickname?.trim() || '이름';

  const formatFixedRow = (value) => (value != null && String(value).trim() !== '' ? String(value).trim() : '—');

  const saveIntro = () => {
    if (isFriendView) return;
    let value = draftIntro;
    if (value.length > MAX_LEN.intro) value = value.slice(0, MAX_LEN.intro);
    setProfile({ intro: value });
    setEditingIntro(false);
    setDraftIntro('');
  };

  const cancelIntroEdit = () => {
    setEditingIntro(false);
    setDraftIntro('');
  };

  const onKeyDownIntro = (e) => {
    if (e.key === 'Escape') cancelIntroEdit();
  };

  const openAvatarModal = () => {
    if (isFriendView) return;
    setPendingAvatar(profile.avatar || AVATAR_OPTIONS[0]);
    setAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setAvatarModalOpen(false);
  };

  const confirmAvatar = () => {
    if (isFriendView) return;
    setProfile({ avatar: pendingAvatar });
    setAvatarModalOpen(false);
  };

  const startIntroEdit = () => {
    if (isFriendView) return;
    setDraftIntro(String(profile.intro ?? ''));
    setEditingIntro(true);
  };

  const renderNameBlock = () => (
    <div className="profile-about-name-row">
      <h2 className="profile-about-name">{displayName}</h2>
    </div>
  );

  const renderIntroBlock = () => {
    const introText = displayProfile?.intro?.toString().trim() ? displayProfile.intro : '—';
    if (isFriendView) {
      return (
        <div className="profile-about-intro">
          <span className="profile-about-intro-label">한줄 소개</span>
          <p className="profile-about-intro-text">{introText}</p>
        </div>
      );
    }
    return (
      <div className={`profile-about-intro ${editingIntro ? 'profile-about-intro--editing' : ''}`}>
        <div className="profile-about-intro-head">
          <span className="profile-about-intro-label">한줄 소개</span>
          <div className="profile-about-inline-actions">
            {editingIntro ? (
              <>
                <button type="button" className="profile-simple-icon profile-simple-icon--ok" onClick={saveIntro} aria-label="저장">
                  ✓
                </button>
                <button type="button" className="profile-simple-icon profile-simple-icon--no" onClick={cancelIntroEdit} aria-label="취소">
                  ✕
                </button>
              </>
            ) : (
              <button type="button" className="profile-simple-icon profile-simple-icon--pen" onClick={startIntroEdit} aria-label="한줄 소개 수정">
                ✏️
              </button>
            )}
          </div>
        </div>
        {editingIntro ? (
          <textarea
            ref={introRef}
            className="profile-about-intro-input"
            value={draftIntro}
            onChange={(e) => setDraftIntro(e.target.value)}
            onKeyDown={onKeyDownIntro}
            placeholder="나를 한 줄로 소개해 보세요"
            rows={3}
            maxLength={MAX_LEN.intro}
            aria-label="한줄 소개 입력"
          />
        ) : (
          <p className="profile-about-intro-text">{introText}</p>
        )}
      </div>
    );
  };

  const renderReadonlyLine = (fieldKey, label) => {
    let raw = '';
    if (isFriendView) {
      raw = displayProfile?.[fieldKey];
    } else if (accountFields) {
      raw = accountFields[fieldKey];
    }
    return (
      <div key={fieldKey} className="profile-simple-row profile-simple-row--readonly">
        <span className="profile-simple-label">{label}</span>
        <div className="profile-simple-main">
          <span className="profile-simple-value">{formatFixedRow(raw)}</span>
        </div>
      </div>
    );
  };

  const sectionTitle = isFriendView ? '친구 프로필' : '내 프로필';

  return (
    <div className="screen active" id="screenProfile">
      <TopBar />
      <div className="screen-header">
        <button type="button" className="back-btn" onClick={goBack} aria-label="뒤로">
          ←
        </button>
        <span>{sectionTitle}</span>
      </div>

      <div className="profile-page-scroll profile-simple-scroll">
        <div className="profile-os-page">
          <section className="profile-win profile-win--about profile-win--unified" aria-labelledby="profile-win-unified-title">
            {/* <header className="profile-win__titlebar">
              <span className="profile-win__dots" aria-hidden>
                <span className="profile-win__dot" />
                <span className="profile-win__dot" />
                <span className="profile-win__dot" />
              </span>
              <span id="profile-win-unified-title" className="profile-win__title">
                <span className="profile-win__title-icon">👤</span>
                {sectionTitle}
              </span>
            </header> */}
            <div className="profile-win__body profile-win__body--about profile-win__body--unified">
              <div className="profile-about-avatar-wrap">
                <div className="profile-simple-avatar-ring profile-simple-avatar-ring--hero profile-about-avatar-ring">
                  <span className="profile-simple-avatar profile-simple-avatar--hero" aria-hidden>
                    {displayProfile?.avatar || '🥚'}
                  </span>
                </div>
                {!isFriendView && (
                  <button type="button" className="profile-simple-avatar-btn profile-about-avatar-btn" onClick={openAvatarModal}>
                    프로필 사진 변경
                  </button>
                )}
              </div>
              {renderNameBlock()}
              {renderIntroBlock()}
              <div className="profile-unified-details">
                <div className="profile-simple-rows">
                  {renderReadonlyLine('university', '대학')}
                  {renderReadonlyLine('major', '학과')}
                  {renderReadonlyLine('schoolYear', '학년')}
                  {renderReadonlyLine('age', '나이')}
                </div>
              </div>
              {visibleFriendCode ? (
                <div className="profile-friend-code" aria-labelledby="profile-friend-code-label">
                  <span id="profile-friend-code-label" className="profile-friend-code-label">
                    친구 코드
                  </span>
                  <div className="profile-friend-code-row">
                    <code className="profile-friend-code-value">{visibleFriendCode}</code>
                    <button type="button" className="profile-friend-code-copy" onClick={copyFriendCode}>
                      복사
                    </button>
                  </div>
                  {copyHint ? <span className="profile-friend-code-hint">{copyHint}</span> : null}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {!isFriendView && avatarModalOpen && (
        <div className="avatar-modal-backdrop" role="presentation" onClick={closeAvatarModal}>
          <div
            className="avatar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="avatar-modal-title" className="avatar-modal-title">
              프로필 사진 변경
            </h2>
            <p className="avatar-modal-desc">사진을 고른 뒤 ✓를 눌러 적용하세요.</p>
            <div className="avatar-modal-grid" role="listbox" aria-label="프로필 아이콘 목록">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  role="option"
                  aria-selected={pendingAvatar === em}
                  className={`avatar-modal-item ${pendingAvatar === em ? 'is-picked' : ''}`}
                  onClick={() => setPendingAvatar(em)}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="avatar-modal-footer">
              <button type="button" className="avatar-modal-foot-btn avatar-modal-foot-btn--cancel" onClick={closeAvatarModal} aria-label="닫기">
                ✕
              </button>
              <button type="button" className="avatar-modal-foot-btn avatar-modal-foot-btn--ok" onClick={confirmAvatar} aria-label="적용">
                ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
