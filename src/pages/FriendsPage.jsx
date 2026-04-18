import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_FRIENDS } from '../data/mockFriends';
import '../styles/FriendsPage.css';

const FriendsPage = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([
    { id: 11, name: '최민지' },
  ]);
  
  const [friendSearch, setFriendSearch] = useState('');

  const filteredFriends = useMemo(() => {
    const keyword = friendSearch.trim().toLowerCase();
    if (!keyword) return MOCK_FRIENDS;
    return MOCK_FRIENDS.filter((friend) => friend.realName.toLowerCase().includes(keyword));
  }, [friendSearch]);

  return (
    <div className="screen active" id="screenFriends">
      <TopBar />
      
      <div className="friends-container">
        {/* 상단 액션 바 (검색 및 버튼들) */}
        <div className="friends-top-actions">
          <div className="friend-search-wrap">
            <span className="friend-search-icon">🔍</span>
            <input
              type="text"
              className="friend-search-input"
              placeholder="이름 검색"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
            />
          </div>
          
          <div className="friend-action-btns">
            <button className="f-action-btn" onClick={() => console.log('친구요청 클릭')}>
              <span className="f-action-icon">📨</span>
              <span className="f-action-label">요청</span>
              {requests.length > 0 && <span className="f-badge">{requests.length}</span>}
            </button>
            <button className="f-action-btn" onClick={() => console.log('친구추가 클릭')}>
              <span className="f-action-icon">➕</span>
              <span className="f-action-label">추가</span>
            </button>
            <button className="f-action-btn" onClick={() => console.log('친구관리 클릭')}>
              <span className="f-action-icon">⚙️</span>
              <span className="f-action-label">관리</span>
            </button>
          </div>
        </div>

        {/* 친구 목록 (스크롤 영역) */}
        <div className="friends-list-wrap">
          {filteredFriends.length === 0 ? (
            <div className="friends-empty">검색된 친구가 없습니다.</div>
          ) : (
            filteredFriends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                className="friend-card"
                onClick={() => navigate(`/profile/friend/${friend.id}`)}
              >
                <div className="fc-pet-info">
                  <span className="fc-pet-name">{friend.petName}</span>
                  <span className="fc-pet-level">Lv. {friend.petLevel}</span>
                </div>
                <div className="fc-user-info">
                  <span className="fc-username">{friend.realName}</span>
                  <div className={`fc-avatar ${friend.online ? '' : 'offline'}`}>{friend.avatar || '🥚'}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FriendsPage;
