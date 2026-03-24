import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const TodoPage = () => {
  return (
    <div className="screen active" id="screenTodo">
      <TopBar />
      <div className="screen-header">
        <span>📅 일정</span>
      </div>
      <div style={{ padding: '20px', textAlign: 'center', flex: 1 }}>
        일정 페이지 준비 중...
      </div>
      <BottomNav />
    </div>
  );
};

export default TodoPage;
