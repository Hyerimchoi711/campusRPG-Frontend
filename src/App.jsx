import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { QuestProvider } from './context/QuestContext';
import { AuthProvider } from './context/AuthContext';
import { GameUserProvider } from './context/GameUserContext';
import { LevelUpProvider } from './context/LevelUpContext';
import { StatsModalProvider } from './context/StatsModalContext';
import { RoleProvider } from './context/RoleContext';
import Layout from './components/Layout';
import RouteLoadingOverlay from './components/RouteLoadingOverlay';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import TodoPage from './pages/TodoPage';
import QuestsPage from './pages/QuestsPage';
import FriendsPage from './pages/FriendsPage';
import ShopPage from './pages/ShopPage';
import ProfilePage from './pages/ProfilePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import EventsPage from './pages/EventsPage';
import './index.css';

function App() {
  return (
    <ProfileProvider>
      <AuthProvider>
        <QuestProvider>
          <Router>
            <RoleProvider>
              <RouteLoadingOverlay />
              <GameUserProvider>
                <LevelUpProvider>
                <StatsModalProvider>
                <Routes>
                  {/* 루트는 휴대폰 프레임 없이 로그인으로 */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  {/* 로그인·회원가입: 전체 화면 (Layout·phone-frame 밖) */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  {/* 게임 화면만 중앙 휴대폰 프레임 */}
                  <Route element={<Layout />}>
                    <Route path="home" element={<HomePage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="todo" element={<TodoPage />} />
                    <Route path="quests" element={<QuestsPage />} />
                    <Route path="friends" element={<FriendsPage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="profile/friend/:id" element={<ProfilePage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Routes>
                </StatsModalProvider>
                </LevelUpProvider>
              </GameUserProvider>
            </RoleProvider>
          </Router>
        </QuestProvider>
      </AuthProvider>
    </ProfileProvider>
  );
}

export default App;
