import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import QuestPage from './pages/QuestPage';
import TodoPage from './pages/TodoPage';
import StatPage from './pages/StatPage';
import FriendPage from './pages/FriendPage';
import ShopPage from './pages/ShopPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* 임시 네비게이션 바 (추후 하단 메뉴로 이동) */}
        <nav className="temp-nav">
          <Link to="/">메인</Link> | 
          <Link to="/quest">퀘스트</Link> | 
          <Link to="/todo">투두리스트</Link> | 
          <Link to="/stat">스탯</Link> | 
          <Link to="/friend">친구</Link> | 
          <Link to="/shop">상점</Link>
        </nav>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/quest" element={<QuestPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/stat" element={<StatPage />} />
          <Route path="/friend" element={<FriendPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
