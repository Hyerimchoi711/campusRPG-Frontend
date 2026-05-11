import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import AvatarDisplay from '../components/AvatarDisplay';
import { useProfile } from '../context/ProfileContext';
import {
  acceptFriendRequest,
  deleteFriend,
  fetchFriendsList,
  fetchIncomingFriendRequests,
  patchFriendsOrder,
  rejectFriendRequest,
  sendFriendRequestByCode,
} from '../api/friendsClient';
import '../styles/FriendsPage.css';

const FriendsPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [toast, setToast] = useState(null);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [friendSearch, setFriendSearch] = useState('');

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    window.setTimeout(() => setToast(null), 3200);
  };

  const loadFriendsAndRequests = useCallback(async () => {
    setListError(null);
    setLoading(true);
    try {
      const [list, incoming] = await Promise.all([fetchFriendsList(), fetchIncomingFriendRequests()]);
      setFriends(list);
      setIncomingRequests(incoming);
    } catch (e) {
      setFriends([]);
      setIncomingRequests([]);
      setListError(e.message || '친구 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriendsAndRequests();
  }, [loadFriendsAndRequests]);

  const filteredFriends = useMemo(() => {
    const keyword = friendSearch.trim().toLowerCase();
    if (!keyword) return friends;
    return friends.filter((f) => f.nickname.toLowerCase().includes(keyword));
  }, [friends, friendSearch]);

  const toggleManageMode = () => {
    setManageMode((m) => {
      const next = !m;
      if (!next) setSelectedIds([]);
      return next;
    });
  };

  const toggleSelect = (userId) => {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const selectAllVisible = () => {
    const ids = filteredFriends.map((f) => f.userId);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : ids);
  };

  const applyOrderToServer = async (orderedList) => {
    const ids = orderedList.map((f) => f.userId);
    await patchFriendsOrder(ids);
  };

  const moveFriend = async (index, dir) => {
    const list = [...friends];
    const j = dir === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setFriends(list);
    try {
      await applyOrderToServer(list);
    } catch (e) {
      showToast(e.message || '순서 저장에 실패했습니다.', true);
      loadFriendsAndRequests();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.length}명을 친구 목록에서 삭제할까요?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteFriend(id)));
      showToast('삭제했습니다.');
      setSelectedIds([]);
      await loadFriendsAndRequests();
    } catch (e) {
      showToast(e.message || '삭제에 실패했습니다.', true);
    }
  };

  const openRequestsModal = async () => {
    setRequestsModalOpen(true);
    try {
      const incoming = await fetchIncomingFriendRequests();
      setIncomingRequests(incoming);
    } catch {
      /* keep previous */
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      showToast('친구가 되었습니다.');
      await loadFriendsAndRequests();
      const incoming = await fetchIncomingFriendRequests();
      setIncomingRequests(incoming);
    } catch (e) {
      showToast(e.message || '수락에 실패했습니다.', true);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('이 친구 요청을 거절할까요?')) return;
    try {
      await rejectFriendRequest(requestId);
      showToast('거절했습니다.');
      const incoming = await fetchIncomingFriendRequests();
      setIncomingRequests(incoming);
    } catch (e) {
      showToast(e.message || '거절 처리에 실패했습니다.', true);
    }
  };

  const handleAddByCode = async (e) => {
    e.preventDefault();
    const code = addCode.trim();
    if (!code) {
      showToast('친구 코드를 입력해 주세요.', true);
      return;
    }
    setAddSubmitting(true);
    try {
      await sendFriendRequestByCode(code);
      showToast('친구 요청을 보냈습니다.');
      setAddModalOpen(false);
      setAddCode('');
    } catch (e) {
      showToast(e.message || '요청을 보내지 못했습니다.', true);
    } finally {
      setAddSubmitting(false);
    }
  };

  const incomingCount = incomingRequests.length;

  return (
    <div className="screen active" id="screenFriends">
      <TopBar />

      {toast ? (
        <div className={`friends-toast${toast.isError ? ' friends-toast--error' : ''}`} role="status">
          {toast.msg}
        </div>
      ) : null}

      <div className="friends-container">
        <div className="friends-top-actions">
          <div className="friend-search-wrap">
            <span className="friend-search-icon">🔍</span>
            <input
              type="text"
              className="friend-search-input"
              placeholder="닉네임 검색"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              disabled={manageMode}
            />
          </div>

          <div className="friend-action-btns">
            <button
              type="button"
              className="f-action-btn"
              onClick={openRequestsModal}
              aria-label={`받은 친구 요청 ${incomingCount}건`}
            >
              <span className="f-action-icon">📨</span>
              <span className="f-action-label">요청</span>
              {incomingCount > 0 ? <span className="f-badge">{incomingCount}</span> : null}
            </button>
            <button
              type="button"
              className="f-action-btn"
              onClick={() => setAddModalOpen(true)}
              aria-label="친구 추가"
            >
              <span className="f-action-icon">➕</span>
              <span className="f-action-label">추가</span>
            </button>
            <button
              type="button"
              className={`f-action-btn${manageMode ? ' f-action-btn--active' : ''}`}
              onClick={toggleManageMode}
              aria-pressed={manageMode}
              aria-label={manageMode ? '관리 종료' : '친구 관리'}
            >
              <span className="f-action-icon">⚙️</span>
              <span className="f-action-label">{manageMode ? '완료' : '관리'}</span>
            </button>
          </div>
        </div>

        <section className="friends-self-card" aria-label="내 프로필 미리보기">
          <button type="button" className="friends-self-card-inner" onClick={() => navigate('/profile')}>
            <div className="friends-self-avatar" aria-hidden>
              <AvatarDisplay
                value={profile.avatar}
                className="friends-self-avatar-emoji"
                imgClassName="friends-self-avatar-img"
              />
            </div>
            <div className="friends-self-text">
              <span className="friends-self-label">내 프로필</span>
              <span className="friends-self-name">{profile.realName?.trim() || '닉네임'}</span>
              <p className="friends-self-intro">
                {profile.intro?.toString().trim() ? profile.intro : '한줄 소개를 프로필에서 작성해 보세요.'}
              </p>
            </div>
            <span className="friends-self-chevron" aria-hidden>
              ›
            </span>
          </button>
        </section>

        {manageMode ? (
          <div className="friends-manage-toolbar">
            <button type="button" className="friends-manage-selectall" onClick={selectAllVisible}>
              {filteredFriends.length > 0 && filteredFriends.every((f) => selectedIds.includes(f.userId))
                ? '선택 해제'
                : '전체 선택'}
            </button>
            <button
              type="button"
              className="friends-manage-delete"
              disabled={selectedIds.length === 0}
              onClick={handleDeleteSelected}
            >
              선택 삭제 ({selectedIds.length})
            </button>
          </div>
        ) : null}

        <div className="friends-list-wrap">
          {loading ? (
            <div className="friends-empty">불러오는 중…</div>
          ) : listError ? (
            <div className="friends-empty friends-empty--error">{listError}</div>
          ) : filteredFriends.length === 0 ? (
            <div className="friends-empty">
              {friends.length === 0 ? '등록된 친구가 없습니다. 친구 코드로 추가해 보세요.' : '검색 결과가 없습니다.'}
            </div>
          ) : (
            filteredFriends.map((friend, idx) => {
              const globalIndex = friends.findIndex((f) => f.userId === friend.userId);
              const canUp = globalIndex > 0;
              const canDown = globalIndex >= 0 && globalIndex < friends.length - 1;
              return (
                <div key={friend.userId} className={`friend-card-row${manageMode ? ' friend-card-row--manage' : ''}`}>
                  {manageMode ? (
                    <label className="friend-card-check">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(friend.userId)}
                        onChange={() => toggleSelect(friend.userId)}
                        aria-label={`${friend.nickname} 선택`}
                      />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    className="friend-card friend-card--main"
                    disabled={manageMode}
                    onClick={() =>
                      !manageMode && navigate(`/profile/friend/${encodeURIComponent(String(friend.userId))}`)
                    }
                  >
                    <div className="fc-main-info">
                      <span className="fc-username">{friend.nickname || '닉네임'}</span>
                      <p className="fc-intro-snippet">
                        {friend.intro?.trim() ? friend.intro : '한줄 소개가 없습니다.'}
                      </p>
                    </div>
                    <div className={`fc-avatar ${manageMode ? 'fc-avatar--dim' : ''}`} aria-hidden>
                      <AvatarDisplay
                        value={friend.avatar}
                        className="fc-avatar-emoji"
                        imgClassName="fc-avatar-img"
                      />
                    </div>
                  </button>
                  {manageMode ? (
                    <div className="friend-card-reorder">
                      <button
                        type="button"
                        className="friend-reorder-btn"
                        disabled={!canUp}
                        onClick={() => moveFriend(globalIndex, 'up')}
                        aria-label="위로"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="friend-reorder-btn"
                        disabled={!canDown}
                        onClick={() => moveFriend(globalIndex, 'down')}
                        aria-label="아래로"
                      >
                        ↓
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {requestsModalOpen ? (
        <div className="friends-modal-backdrop" role="presentation" onClick={() => setRequestsModalOpen(false)}>
          <div
            className="friends-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="friends-requests-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="friends-modal-header">
              <h2 id="friends-requests-title" className="friends-modal-title">
                받은 친구 요청
              </h2>
              <button type="button" className="friends-modal-close" onClick={() => setRequestsModalOpen(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="friends-modal-body">
              {incomingRequests.length === 0 ? (
                <p className="friends-modal-empty">새로운 요청이 없습니다.</p>
              ) : (
                <ul className="friends-request-list">
                  {incomingRequests.map((req) => (
                    <li key={req.id} className="friends-request-item">
                      <div className="friends-request-avatar" aria-hidden>
                        <AvatarDisplay
                          value={req.avatar}
                          className="friends-request-avatar-emoji"
                          imgClassName="friends-request-avatar-img"
                        />
                      </div>
                      <div className="friends-request-meta">
                        <span className="friends-request-name">{req.nickname || '닉네임'}</span>
                        <p className="friends-request-intro">{req.intro?.trim() ? req.intro : '—'}</p>
                      </div>
                      <div className="friends-request-actions">
                        <button type="button" className="friends-request-btn friends-request-btn--ok" onClick={() => handleAccept(req.id)}>
                          수락
                        </button>
                        <button type="button" className="friends-request-btn friends-request-btn--no" onClick={() => handleReject(req.id)}>
                          거절
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {addModalOpen ? (
        <div className="friends-modal-backdrop" role="presentation" onClick={() => !addSubmitting && setAddModalOpen(false)}>
          <div
            className="friends-modal friends-modal--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="friends-add-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="friends-modal-header">
              <h2 id="friends-add-title" className="friends-modal-title">
                친구 코드로 추가
              </h2>
              <button
                type="button"
                className="friends-modal-close"
                disabled={addSubmitting}
                onClick={() => setAddModalOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <form className="friends-modal-body" onSubmit={handleAddByCode}>
              <p className="friends-add-hint">상대방 프로필에 표시된 친구 코드를 입력하면 요청이 전달됩니다.</p>
              <input
                type="text"
                className="friends-add-input"
                placeholder="친구 코드"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                autoComplete="off"
                disabled={addSubmitting}
              />
              <div className="friends-modal-footer-btns">
                <button type="button" className="friends-modal-foot-secondary" disabled={addSubmitting} onClick={() => setAddModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="friends-modal-foot-primary" disabled={addSubmitting}>
                  {addSubmitting ? '전송 중…' : '요청 보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
};

export default FriendsPage;
