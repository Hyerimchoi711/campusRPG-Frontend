import React, { useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FriendsPage = () => {
  const [friends, setFriends] = useState([
    { id: 1, name: '김현우', major: '컴퓨터공학과', level: 12, online: true },
    { id: 2, name: '이지은', major: '경영학과', level: 9, online: false },
    { id: 3, name: '박서준', major: '전자공학과', level: 15, online: true },
  ]);
  const [requests, setRequests] = useState([
    { id: 11, name: '최민지', message: '스터디 같이 할래요?' },
    { id: 12, name: '정도윤', message: '오늘 동아리 퀘스트 같이 깨요!' },
  ]);
  const [friendSearch, setFriendSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [addMessage, setAddMessage] = useState('');

  // TODO: 실제 연동 시 DB API 결과로 대체
  const membersInDb = [
    { memberId: '20230001', name: '김현우', major: '컴퓨터공학과', level: 12, online: true },
    { memberId: '20230018', name: '최민지', major: '디자인학과', level: 10, online: false },
    { memberId: '20230035', name: '정도윤', major: '경영학과', level: 14, online: true },
    { memberId: '20230102', name: '한지수', major: '전자공학과', level: 8, online: false },
    { memberId: '20230177', name: '오세훈', major: '컴퓨터공학과', level: 11, online: true },
  ];

  const filteredFriends = useMemo(() => {
    const keyword = friendSearch.trim().toLowerCase();
    if (!keyword) return friends;
    return friends.filter((friend) => friend.name.toLowerCase().includes(keyword));
  }, [friendSearch, friends]);

  const matchedMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase();
    if (!keyword) return [];
    return membersInDb.filter(
      (member) =>
        member.name.toLowerCase().includes(keyword) || member.memberId.toLowerCase().includes(keyword),
    );
  }, [memberSearch]);

  const handleAddFriend = (member) => {
    const alreadyFriend = friends.some((friend) => friend.name === member.name);
    if (alreadyFriend) {
      setAddMessage(`${member.name}님은 이미 친구 목록에 있어요.`);
      return;
    }

    setFriends((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: member.name,
        major: member.major,
        level: member.level,
        online: member.online,
      },
    ]);
    setAddMessage(`${member.name}님을 친구로 추가했어요.`);
  };

  const handleAcceptRequest = (request) => {
    const member = membersInDb.find((item) => item.name === request.name);
    const alreadyFriend = friends.some((friend) => friend.name === request.name);

    if (!alreadyFriend) {
      setFriends((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: request.name,
          major: member?.major ?? '미확인 학과',
          level: member?.level ?? 1,
          online: member?.online ?? false,
        },
      ]);
    }

    setRequests((prev) => prev.filter((item) => item.id !== request.id));
    setAddMessage(
      alreadyFriend
        ? `${request.name}님은 이미 친구 목록에 있어요. 요청만 정리했어요.`
        : `${request.name}님의 요청을 수락하고 친구에 추가했어요.`,
    );
  };

  const handleRejectRequest = (requestId) => {
    setRequests((prev) => prev.filter((item) => item.id !== requestId));
  };

  return (
    <div className="screen active" id="screenFriends">
      <TopBar />
      <div className="screen-header">
        <span>👥 친구 목록</span>
        <span className="header-lv">{friends.length}명</span>
      </div>

      <div style={{ padding: '10px 12px 6px', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="game-input"
          placeholder="내 친구 이름 검색"
          value={friendSearch}
          onChange={(e) => setFriendSearch(e.target.value)}
          style={{ border: '2px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}
        />
      </div>

      <div className="section-header">
        <span className="section-icon">🟢</span>
        <span>내 친구 {friendSearch ? '(검색 결과)' : ''}</span>
      </div>

      <div className="quest-list" style={{ flex: 0, maxHeight: 220 }}>
        {filteredFriends.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '20px 0' }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div key={friend.id} className="quest-item" style={{ cursor: 'default' }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: friend.online ? 'var(--accent2)' : 'var(--text-dim)',
                  border: '2px solid var(--bg-wood)',
                  flexShrink: 0,
                }}
              />
              <div className="quest-info">
                <div className="quest-name">{friend.name} · Lv.{friend.level}</div>
                <div className="quest-reward">{friend.major}</div>
              </div>
              <div className="quest-xp" style={{ color: friend.online ? 'var(--accent3)' : 'var(--text-dim)' }}>
                {friend.online ? '온라인' : '오프라인'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section-header">
        <span className="section-icon">➕</span>
        <span>친구 추가</span>
      </div>

      <div style={{ padding: '0 12px 8px', display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="game-input"
          placeholder="회원 이름 또는 고유 ID 검색"
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          style={{ border: '2px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}
        />
      </div>

      {addMessage && (
        <div style={{ padding: '0 12px 6px', fontSize: 11, color: 'var(--accent3)' }}>
          {addMessage}
        </div>
      )}

      <div className="quest-list" style={{ flex: 0, maxHeight: 170, paddingBottom: 8 }}>
        {memberSearch.trim() === '' ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '20px 0' }}>
            이름 또는 ID로 회원을 검색해 주세요.
          </div>
        ) : matchedMembers.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '20px 0' }}>
            등록된 회원을 찾지 못했습니다.
          </div>
        ) : (
          matchedMembers.map((member) => (
            <div key={member.memberId} className="quest-item" style={{ cursor: 'default' }}>
              <div className="quest-check empty">👤</div>
              <div className="quest-info">
                <div className="quest-name">
                  {member.name} · Lv.{member.level}
                </div>
                <div className="quest-reward">
                  ID: {member.memberId} · {member.major}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary small"
                onClick={() => handleAddFriend(member)}
                style={{ paddingInline: 12 }}
              >
                친구 추가
              </button>
            </div>
          ))
        )}
      </div>

      <div className="section-header">
        <span className="section-icon">📨</span>
        <span>친구 요청</span>
        <span className="section-badge">{requests.length}</span>
      </div>

      <div className="quest-list" style={{ paddingBottom: 12 }}>
        {requests.map((request) => (
          <div key={request.id} className="quest-item" style={{ cursor: 'default' }}>
            <div className="quest-check empty">👤</div>
            <div className="quest-info">
              <div className="quest-name">{request.name}</div>
              <div className="quest-reward">{request.message}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn-primary small"
                style={{ paddingInline: 12 }}
                onClick={() => handleAcceptRequest(request)}
              >
                수락
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: 'auto', padding: '8px 10px' }}
                onClick={() => handleRejectRequest(request.id)}
              >
                거절
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default FriendsPage;
