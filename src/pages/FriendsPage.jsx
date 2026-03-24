import React from 'react';
import BottomNav from '../components/BottomNav';

const FriendsPage = () => {
  return (
    <div className="screen active" id="screenFriends">
      <div className="screen-header">
        <span>👥 친구</span>
      </div>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        친구 페이지 준비 중...
      </div>
      <BottomNav />
    </div>
  );
};

export default FriendsPage;
