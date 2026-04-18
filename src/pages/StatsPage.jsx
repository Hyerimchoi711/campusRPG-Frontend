import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/StatsPage.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const StatsPage = () => {
  const navigate = useNavigate();

  // State for stats
  const [stats, setStats] = useState({
    health: 45,
    social: 55,
    diligent: 72,
    focus: 80,
    creative: 63,
  });

  // State for fatigue
  const [fatigue, setFatigue] = useState(30);
  const MAX_FATIGUE = 70;

  const [animatedWidths, setAnimatedWidths] = useState({
    health: 0,
    social: 0,
    diligent: 0,
    focus: 0,
    creative: 0,
    fatigue: 0
  });

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedWidths({
        health: (stats.health / getTargetValue(stats.health)) * 100,
        social: (stats.social / getTargetValue(stats.social)) * 100,
        diligent: (stats.diligent / getTargetValue(stats.diligent)) * 100,
        focus: (stats.focus / getTargetValue(stats.focus)) * 100,
        creative: (stats.creative / getTargetValue(stats.creative)) * 100,
        fatigue: (fatigue / MAX_FATIGUE) * 100
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [stats, fatigue]);

  const getTargetValue = (currentValue) => {
    return Math.ceil(currentValue / 100) * 100 || 100;
  };

  const chartData = {
    labels: ['건강', '사교', '성실', '집중', '창의'],
    datasets: [
      {
        label: '내 스탯',
        data: [stats.health, stats.social, stats.diligent, stats.focus, stats.creative],
        backgroundColor: 'rgba(139, 195, 74, 0.25)',
        borderColor: 'rgba(139, 195, 74, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(139, 195, 74, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 195, 74, 1)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false, // Hide the numbers on the axes
          stepSize: 25, // Reduce the number of grid lines
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'NeoDunggeunmo', 'Press Start 2P', cursive",
          },
          color: '#666',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="screen active" id="screenStats">
      <TopBar />
      
      {/* 레이더 차트 영역 */}
      <div className="chart-container">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* 스탯 상세 */}
      <div className="stat-detail-list">
        <div className="stat-row">
          <span className="stat-icon">🏃</span>
          <span className="stat-name">건강</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill health" style={{width: `${animatedWidths.health}%`}}></div>
            </div>
          </div>
          <span className="stat-val">{stats.health}/{getTargetValue(stats.health)} ({Math.floor((stats.health / getTargetValue(stats.health)) * 100)}%)</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🤝</span>
          <span className="stat-name">사교</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill social" style={{width: `${animatedWidths.social}%`}}></div>
            </div>
          </div>
          <span className="stat-val">{stats.social}/{getTargetValue(stats.social)} ({Math.floor((stats.social / getTargetValue(stats.social)) * 100)}%)</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">💪</span>
          <span className="stat-name">성실</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill diligent" style={{width: `${animatedWidths.diligent}%`}}></div>
            </div>
          </div>
          <span className="stat-val">{stats.diligent}/{getTargetValue(stats.diligent)} ({Math.floor((stats.diligent / getTargetValue(stats.diligent)) * 100)}%)</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🎯</span>
          <span className="stat-name">집중</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill focus" style={{width: `${animatedWidths.focus}%`}}></div>
            </div>
          </div>
          <span className="stat-val">{stats.focus}/{getTargetValue(stats.focus)} ({Math.floor((stats.focus / getTargetValue(stats.focus)) * 100)}%)</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">💡</span>
          <span className="stat-name">창의</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill creative" style={{width: `${animatedWidths.creative}%`}}></div>
            </div>
          </div>
          <span className="stat-val">{stats.creative}/{getTargetValue(stats.creative)} ({Math.floor((stats.creative / getTargetValue(stats.creative)) * 100)}%)</span>
        </div>
      </div>

      {/* 피로도 UI */}
      <div className="fatigue-section">
        <div className="fatigue-header">
          <span className="fatigue-title">오늘의 피로도</span>
          <span className="fatigue-val">{fatigue} / {MAX_FATIGUE}</span>
        </div>
        <div className="fatigue-bar-track">
          <div className="fatigue-bar-fill" style={{width: `${animatedWidths.fatigue}%`}}></div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default StatsPage;
