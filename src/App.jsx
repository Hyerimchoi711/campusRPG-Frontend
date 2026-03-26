import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import TodoPage from './pages/TodoPage';
import QuestsPage from './pages/QuestsPage';
import FriendsPage from './pages/FriendsPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="todo" element={<TodoPage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="friends" element={<FriendsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
