import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PetPortrait from '../components/PetPortrait';
import { useProfile } from '../context/ProfileContext';
import { getFriendById } from '../data/mockFriends';
import {
  DEFAULT_EGG_PET_NAME,
  formatLastEvolvedAt,
  getLineageBadgeText,
  getPetSpeciesDescription,
  getPetSpeciesLabel,
  isPetEggUi,
  normalizeAnimalTypeKey,
} from '../models/pet';
import '../styles/ProfilePage.css';

const AVATAR_OPTIONS = ['🥚', '🧑‍🎓', '👩‍🎓', '🦉', '📚', '🌱', '⭐', '🎮'];

const MAX_LEN = {
  university: 40,
  realName: 24,
  major: 40,
  schoolYear: 2,
  age: 3,
  intro: 160,
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id: friendRouteId } = useParams();
  const isFriendView = Boolean(friendRouteId);
  const friend = isFriendView ? getFriendById(friendRouteId) : null;

  const { profile, setProfile } = useProfile();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(AVATAR_OPTIONS[0]);
  const fieldRef = useRef(null);

  const friendDisplay = useMemo(() => {
    if (!friend) return null;
    const { id: _id, online: _on, ...rest } = friend;
    return rest;
  }, [friend]);

  const displayProfile = isFriendView ? friendDisplay : profile;

  useEffect(() => {
    setEditing(null);
    setDraft('');
    setAvatarModalOpen(false);
  }, [friendRouteId]);

  useEffect(() => {
    if (editing && fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (!avatarModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setAvatarModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [avatarModalOpen]);

  const goBack = () => navigate(-1);

  if (isFriendView && !friend) {
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
            <p className="profile-friend-missing-text">친구를 찾을 수 없어요.</p>
            <button type="button" className="profile-simple-avatar-btn" onClick={() => navigate('/friends')}>
              친구 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = displayProfile.realName?.trim() || '이름';

  const startEdit = (field) => {
    setEditing(field);
    setDraft(String(profile[field] ?? ''));
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };

  const saveEdit = () => {
    if (!editing) return;
    const key = editing;
    let value = draft;
    if (key === 'intro') {
      value = draft;
      if (value.length > MAX_LEN.intro) value = value.slice(0, MAX_LEN.intro);
    } else if (key === 'age' || key === 'schoolYear') {
      value = draft.replace(/\D/g, '').slice(0, MAX_LEN[key]);
    } else if (typeof draft === 'string') {
      value = draft.trim();
      const max = MAX_LEN[key];
      if (max && value.length > max) value = value.slice(0, max);
    }
    setProfile({ [key]: value });
    setEditing(null);
    setDraft('');
  };

  const onKeyDownText = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') cancelEdit();
  };

  const onKeyDownIntro = (e) => {
    if (e.key === 'Escape') cancelEdit();
  };

  const openAvatarModal = () => {
    setPendingAvatar(profile.avatar || AVATAR_OPTIONS[0]);
    setAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setAvatarModalOpen(false);
  };

  const confirmAvatar = () => {
    setProfile({ avatar: pendingAvatar });
    setAvatarModalOpen(false);
  };

  const renderNameBlock = () => {
    if (isFriendView) {
      return (
        <div className="profile-about-name-row">
          <h2 className="profile-about-name">{displayName}</h2>
        </div>
      );
    }
    const isEditing = editing === 'realName';
    return (
      <div className={`profile-about-name-row ${isEditing ? 'profile-about-name-row--editing' : ''}`}>
        <div className="profile-about-name-main">
          {isEditing ? (
            <input
              ref={fieldRef}
              type="text"
              className="profile-about-name-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDownText}
              placeholder="이름"
              maxLength={MAX_LEN.realName}
              aria-label="이름 입력"
            />
          ) : (
            <h2 className="profile-about-name">{displayName}</h2>
          )}
        </div>
        <div className="profile-about-inline-actions">
          {isEditing ? (
            <>
              <button type="button" className="profile-simple-icon profile-simple-icon--ok" onClick={saveEdit} aria-label="저장">
                ✓
              </button>
              <button type="button" className="profile-simple-icon profile-simple-icon--no" onClick={cancelEdit} aria-label="취소">
                ✕
              </button>
            </>
          ) : (
            <button type="button" className="profile-simple-icon profile-simple-icon--pen" onClick={() => startEdit('realName')} aria-label="이름 수정">
              ✏️
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderIntroBlock = () => {
    const introText = displayProfile.intro?.toString().trim() ? displayProfile.intro : '—';
    if (isFriendView) {
      return (
        <div className="profile-about-intro">
          <span className="profile-about-intro-label">한줄 소개</span>
          <p className="profile-about-intro-text">{introText}</p>
        </div>
      );
    }
    const isEditing = editing === 'intro';
    return (
      <div className={`profile-about-intro ${isEditing ? 'profile-about-intro--editing' : ''}`}>
        <div className="profile-about-intro-head">
          <span className="profile-about-intro-label">한줄 소개</span>
          <div className="profile-about-inline-actions">
            {isEditing ? (
              <>
                <button type="button" className="profile-simple-icon profile-simple-icon--ok" onClick={saveEdit} aria-label="저장">
                  ✓
                </button>
                <button type="button" className="profile-simple-icon profile-simple-icon--no" onClick={cancelEdit} aria-label="취소">
                  ✕
                </button>
              </>
            ) : (
              <button type="button" className="profile-simple-icon profile-simple-icon--pen" onClick={() => startEdit('intro')} aria-label="한줄 소개 수정">
                ✏️
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <textarea
            ref={fieldRef}
            className="profile-about-intro-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
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

  const renderLine = (fieldKey, label, type = 'text', placeholder = '') => {
    if (isFriendView) {
      return (
        <div key={fieldKey} className="profile-simple-row profile-simple-row--readonly">
          <span className="profile-simple-label">{label}</span>
          <div className="profile-simple-main">
            <span className="profile-simple-value">
              {displayProfile[fieldKey]?.toString().trim() ? displayProfile[fieldKey] : '—'}
            </span>
          </div>
        </div>
      );
    }
    const isEditing = editing === fieldKey;
    return (
      <div key={fieldKey} className={`profile-simple-row ${isEditing ? 'profile-simple-row--editing' : ''}`}>
        <span className="profile-simple-label">{label}</span>
        <div className="profile-simple-main">
          {isEditing ? (
            type === 'textarea' ? (
              <textarea
                ref={fieldRef}
                className="profile-simple-input profile-simple-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDownIntro}
                placeholder={placeholder}
                rows={3}
                maxLength={MAX_LEN.intro}
              />
            ) : (
              <input
                ref={fieldRef}
                type="text"
                inputMode={fieldKey === 'age' || fieldKey === 'schoolYear' ? 'numeric' : undefined}
                className="profile-simple-input"
                value={draft}
                onChange={(e) => {
                  if (fieldKey === 'age' || fieldKey === 'schoolYear') {
                    const max = MAX_LEN[fieldKey];
                    setDraft(e.target.value.replace(/\D/g, '').slice(0, max));
                  } else {
                    setDraft(e.target.value);
                  }
                }}
                onKeyDown={onKeyDownText}
                placeholder={placeholder}
                maxLength={MAX_LEN[fieldKey] ?? 40}
              />
            )
          ) : (
            <span className="profile-simple-value">
              {displayProfile[fieldKey]?.toString().trim() ? displayProfile[fieldKey] : '—'}
            </span>
          )}
        </div>
        <div className="profile-simple-actions">
          {isEditing ? (
            <>
              <button type="button" className="profile-simple-icon profile-simple-icon--ok" onClick={saveEdit} aria-label="저장">
                ✓
              </button>
              <button type="button" className="profile-simple-icon profile-simple-icon--no" onClick={cancelEdit} aria-label="취소">
                ✕
              </button>
            </>
          ) : (
            <button
              type="button"
              className="profile-simple-icon profile-simple-icon--pen"
              onClick={() => startEdit(fieldKey)}
              aria-label={`${label} 수정`}
            >
              ✏️
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPetBody = () => {
    const p = displayProfile;
    const isEgg = isPetEggUi(p.petAnimalType, p.petStage);
    const rawAt = typeof p.petAnimalType === 'string' ? p.petAnimalType.trim() : '';
    const animalType = isEgg ? 'egg' : normalizeAnimalTypeKey(rawAt || '파이루');
    const levelRaw = Number(p.petLevel);
    const level = Number.isFinite(levelRaw) && levelRaw >= 0 ? Math.floor(levelRaw) : 1;
    const petTitle =
      (p.petName && String(p.petName).trim()) ||
      (isEgg ? DEFAULT_EGG_PET_NAME : getPetSpeciesLabel(animalType));
    const statusLabel = isEgg ? '상태 · 부화중인 알' : `종족 · ${getPetSpeciesLabel(animalType)}`;
    const lineageChip = !isEgg ? getLineageBadgeText(p.petLineageType) : null;
    const evolvedLine = !isEgg ? formatLastEvolvedAt(p.petLastEvolvedAt) : null;
    const desc = getPetSpeciesDescription(animalType);

    return (
      <div className="profile-pet-win-body" aria-label="펫 정보">
        <div className="profile-pet-win-visual">
          <div className={`profile-pet-egg-hitbox pet-egg-hitbox${isEgg ? '' : ' profile-pet-egg-hitbox--species'}`}>
            <PetPortrait
              animalType={animalType}
              alt=""
              imgClassName={`profile-pet-img${isEgg ? ' pet-egg-hop' : ' profile-pet-img--species'}`}
              emojiClassName="profile-pet-emoji"
            />
          </div>
        </div>
        <div className="profile-pet-win-meta">
          {lineageChip ? <span className="profile-pet-lineage-chip">계보 · {lineageChip}</span> : null}
          <span className="profile-pet-win-name">{petTitle}</span>
          <span className="profile-pet-win-stat">{statusLabel}</span>
          {evolvedLine ? <span className="profile-pet-evolved-at">마지막 진화 · {evolvedLine}</span> : null}
          <p className="profile-pet-desc">{desc}</p>
          <span className="profile-pet-level profile-pet-level--win">Lv. {level}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="screen active" id="screenProfile">
      <TopBar />
      <div className="screen-header">
        <button type="button" className="back-btn" onClick={goBack} aria-label="뒤로">
          ←
        </button>
        <span>{isFriendView ? '친구 프로필' : '내 프로필'}</span>
      </div>

      <div className="profile-page-scroll profile-simple-scroll">
        <div className="profile-os-page">
          <div className="profile-os-top">
            <section className="profile-win profile-win--about" aria-labelledby="profile-win-about-title">
              <header className="profile-win__titlebar">
                <span className="profile-win__dots" aria-hidden>
                  <span className="profile-win__dot" />
                  <span className="profile-win__dot" />
                  <span className="profile-win__dot" />
                </span>
                <span id="profile-win-about-title" className="profile-win__title">
                  <span className="profile-win__title-icon">👤</span>
                  프로필
                </span>
              </header>
              <div className="profile-win__body profile-win__body--about">
                <div className="profile-about-avatar-wrap">
                  <div className="profile-simple-avatar-ring profile-simple-avatar-ring--hero profile-about-avatar-ring">
                    <span className="profile-simple-avatar profile-simple-avatar--hero" aria-hidden>
                      {displayProfile.avatar || '🥚'}
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
              </div>
            </section>

            <section className="profile-win profile-win--pet" aria-labelledby="profile-win-pet-title">
              <header className="profile-win__titlebar profile-win__titlebar--pet">
                <span className="profile-win__dots" aria-hidden>
                  <span className="profile-win__dot" />
                  <span className="profile-win__dot" />
                  <span className="profile-win__dot" />
                </span>
                <span id="profile-win-pet-title" className="profile-win__title">
                  <span className="profile-win__title-icon">🐾</span>
                  {isFriendView ? '펫' : '내 펫'}
                </span>
              </header>
              <div className="profile-win__body profile-win__body--pet">{renderPetBody()}</div>
            </section>
          </div>

          <section className="profile-win profile-win--details" aria-labelledby="profile-win-details-title">
            <header className="profile-win__titlebar profile-win__titlebar--details">
              <span className="profile-win__dots" aria-hidden>
                <span className="profile-win__dot" />
                <span className="profile-win__dot" />
                <span className="profile-win__dot" />
              </span>
              <span id="profile-win-details-title" className="profile-win__title">
                <span className="profile-win__title-icon">📋</span>
                상세 정보
              </span>
              <span className="profile-win__urlfake" aria-hidden>
                campus.quest / detail
              </span>
            </header>
            <div className="profile-win__body profile-win__body--details">
              <div className="profile-simple-rows">
                {renderLine('university', '대학', 'text', 'OO대학교')}
                {renderLine('major', '학과', 'text', 'OO학과')}
                {renderLine('schoolYear', '학년', 'text', '예: 2')}
                {renderLine('age', '나이', 'text', '예: 21')}
              </div>
            </div>
          </section>

          {!isFriendView && (
            <p className="profile-simple-hint">
              위 프로필 박스에서 이름·한줄 소개를, 아래에서 대학·학과·학년·나이를 ✏️로 수정할 수 있어요. 퀘스트 NPC는 학과·학년을 참고해 맞춤 퀘스트를 만듭니다.
            </p>
          )}
        </div>
      </div>

      {!isFriendView && avatarModalOpen && (
        <div
          className="avatar-modal-backdrop"
          role="presentation"
          onClick={closeAvatarModal}
        >
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
