import React, { useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/FriendsPage.css';

const FriendsPage = () => {
  // 임시 데이터: 펫 이름과 레벨 추가
  const [friends, setFriends] = useState([
    { id: 1, name: '김현우', petName: '불꽃드래곤', petLevel: 12, online: true },
    { id: 2, name: '이지은', petName: '아기슬라임', petLevel: 9, online: false },
    { id: 3, name: '박서준', petName: '바람정령', petLevel: 15, online: true },
    { id: 4, name: '최민지', petName: '황금독수리', petLevel: 22, online: true },
    { id: 5, name: '정도윤', petName: '물개구리', petLevel: 5, online: false },
    { id: 6, name: '한지수', petName: '숲의요정', petLevel: 18, online: true },
    { id: 7, name: '오세훈', petName: '그림자늑대', petLevel: 30, online: false },
  ]);
  
  const [requests, setRequests] = useState([
    { id: 11, name: '최민지' },
  ]);
  
  const [friendSearch, setFriendSearch] = useState('');

  const filteredFriends = useMemo(() => {
    const keyword = friendSearch.trim().toLowerCase();
    if (!keyword) return friends;
    return friends.filter((friend) => friend.name.toLowerCase().includes(keyword));
  }, [friendSearch, friends]);

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
              <div key={friend.id} className="friend-card">
                {/* 왼쪽: 펫 정보 */}
                <div className="fc-pet-info">
                  <span className="fc-pet-name">{friend.petName}</span>
                  <span className="fc-pet-level">Lv. {friend.petLevel}</span>
                </div>
                
                {/* 오른쪽: 유저 정보 및 아이콘 */}
                <div className="fc-user-info">
                  <span className="fc-username">{friend.name}</span>
                  <div className={`fc-avatar ${friend.online ? '' : 'offline'}`}>
                    🥚
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FriendsPage;
