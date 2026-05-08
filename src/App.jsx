import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { QuestProvider } from './context/QuestContext';
import { AuthProvider } from './context/AuthContext';
import { GameUserProvider } from './context/GameUserContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import InventoryPage from './pages/InventoryPage';
import TodoPage from './pages/TodoPage';
import QuestsPage from './pages/QuestsPage';
import FriendsPage from './pages/FriendsPage';
import ShopPage from './pages/ShopPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function App() {
  return (
    <ProfileProvider>
      <QuestProvider>
        <AuthProvider>
          <Router>
            <GameUserProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/login" replace />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="stats" element={<StatsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="todo" element={<TodoPage />} />
                  <Route path="quests" element={<QuestsPage />} />
                  <Route path="friends" element={<FriendsPage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="profile/friend/:id" element={<ProfilePage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Routes>
            </GameUserProvider>
          </Router>
        </AuthProvider>
      </QuestProvider>
    </ProfileProvider>
  );
}

export default App;
