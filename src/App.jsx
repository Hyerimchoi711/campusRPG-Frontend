import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import AvatarPage from './pages/AvatarPage';
import AchievePage from './pages/AchievePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="avatar" element={<AvatarPage />} />
          <Route path="achieve" element={<AchievePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
