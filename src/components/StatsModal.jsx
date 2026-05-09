import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import PetPortrait from './PetPortrait';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_EGG_PET_NAME, normalizePet } from '../models/pet';
import '../styles/StatsPage.css';
import './StatsModal.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/** 건강 · 사교 · 성실 · 집중 · 창의 — 레이더 꼭짓점 순서와 동일 (선명 RGB) */
const RADAR_AXIS_COLORS = {
  stroke: ['#059669', '#db2777', '#ca8a04', '#0284c7', '#ea580c'],
  point: ['#10b981', '#f472b6', '#fcd34d', '#38bdf8', '#fb923c'],
  /** 축 글자 — 리스트·레이더 동일 톤(선명 RGB) */
  label: ['#059669', '#db2777', '#ca8a04', '#0284c7', '#ea580c'],
  /** 오각형 내부(원뿔 그라데이션 구간별) — 첫 축 위쪽 정렬 시 -90° 시작 */
  fill: ['rgba(16,185,129,0.78)', 'rgba(244,114,182,0.74)', 'rgba(250,204,21,0.76)', 'rgba(56,189,248,0.74)', 'rgba(251,146,60,0.76)'],
};

/**
 * 레이더 중심에 맞춘 원뿔(conic) 그라데이션으로 오각형 면 자체를 스탯별로 채움.
 * 레이더 첫 번째 값은 일반적으로 12시 방향.
 */
function radarPolygonFillStyle(chart) {
  const ctx = chart?.ctx;
  const scale = chart?.scales?.r;
  if (!ctx || !scale || scale.xCenter == null || scale.yCenter == null) {
    return 'rgba(16,185,129,0.62)';
  }
  const cx = scale.xCenter;
  const cy = scale.yCenter;
  const n = RADAR_AXIS_COLORS.fill.length;
  const fills = RADAR_AXIS_COLORS.fill;

  if (typeof ctx.createConicGradient !== 'function') {
    const r = typeof scale.drawingArea === 'number' && scale.drawingArea > 0 ? scale.drawingArea : 80;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, 'rgba(56,189,248,0.65)');
    rg.addColorStop(0.85, fills[Math.floor(n / 2)]);
    rg.addColorStop(1, fills[n - 1]);
    return rg;
  }

  const g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n - 1e-5;
    g.addColorStop(t0, fills[i]);
    if (t1 > t0) {
      g.addColorStop(Math.max(t0, t1), fills[i]);
    }
  }
  g.addColorStop(1, fills[0]);
  return g;
}

const MAX_FATIGUE = 70;

function getTargetValue(currentValue) {
  return Math.ceil(currentValue / 100) * 100 || 100;
}

function StatsModalContent() {
  const { me } = useAuth();
  const pet = normalizePet(me?.pet);

  const [stats] = useState({
    health: 45,
    social: 55,
    diligent: 72,
    focus: 80,
    creative: 63,
  });
  const [fatigue] = useState(30);

  const [animatedWidths, setAnimatedWidths] = useState({
    health: 0,
    social: 0,
    diligent: 0,
    focus: 0,
    creative: 0,
    fatigue: 0,
  });

  useEffect(() => {
    const t = window.setTimeout(() => {
      setAnimatedWidths({
        health: (stats.health / getTargetValue(stats.health)) * 100,
        social: (stats.social / getTargetValue(stats.social)) * 100,
        diligent: (stats.diligent / getTargetValue(stats.diligent)) * 100,
        focus: (stats.focus / getTargetValue(stats.focus)) * 100,
        creative: (stats.creative / getTargetValue(stats.creative)) * 100,
        fatigue: (fatigue / MAX_FATIGUE) * 100,
      });
    }, 80);
    return () => window.clearTimeout(t);
  }, [stats, fatigue]);

  const chartData = {
    labels: ['건강', '사교', '성실', '집중', '창의'],
    datasets: [
      {
        label: '내 스탯',
        data: [stats.health, stats.social, stats.diligent, stats.focus, stats.creative],
        backgroundColor: (chartCtx) => radarPolygonFillStyle(chartCtx.chart),
        borderWidth: 0,
        pointBackgroundColor: RADAR_AXIS_COLORS.point,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: RADAR_AXIS_COLORS.point,
        pointRadius: 5,
        pointHoverRadius: 6,
        /* 오각형 각 변마다 다른 색 (Chart.js 4 line segment) */
        segment: {
          borderColor: (ctx) => RADAR_AXIS_COLORS.stroke[ctx.p0DataIndex] ?? RADAR_AXIS_COLORS.stroke[0],
          borderWidth: 3,
        },
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0,0,0,0.12)' },
        grid: { color: 'rgba(0,0,0,0.09)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false, stepSize: 25 },
        pointLabels: {
          font: { size: 11, family: 'var(--pixel-font), monospace', weight: '700' },
          backdropColor: 'rgba(255,255,255,0.72)',
          backdropPadding: 4,
          borderRadius: 6,
          color: (ctx) => RADAR_AXIS_COLORS.label[ctx?.index ?? 0] ?? RADAR_AXIS_COLORS.label[0],
        },
      },
    },
    elements: {
      line: {
        /* segment가 변 색을 담당 — 기본 선은 안 보이게 */
        borderWidth: 0,
      },
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  const petAnimalType = pet?.animalType ?? 'egg';
  const petNameLabel = pet?.name?.trim() || DEFAULT_EGG_PET_NAME;

  return (
    <div className="stats-modal-body-split">
      <aside className="stats-modal-pet" aria-label="현재 펫">
        <div className="stats-modal-pet-frame">
          <PetPortrait
            animalType={petAnimalType}
            alt=""
            imgClassName="stats-modal-pet-img"
            emojiClassName="stats-modal-pet-emoji"
          />
        </div>
        <span className="stats-modal-pet-name">{petNameLabel}</span>
      </aside>

      <div className="stats-modal-main-col">
      <div className="stats-modal-chart">
        <Radar data={chartData} options={chartOptions} />
      </div>

      <div className="stat-detail-list stats-modal-detail-list">
        <div className="stat-row stat-variant-health">
          <span className="stat-icon">🏃</span>
          <span className="stat-name">건강</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill health" style={{ width: `${animatedWidths.health}%` }} />
            </div>
          </div>
          <span className="stat-val">
            {stats.health}/{getTargetValue(stats.health)} (
            {Math.floor((stats.health / getTargetValue(stats.health)) * 100)}%)
          </span>
        </div>
        <div className="stat-row stat-variant-social">
          <span className="stat-icon">🤝</span>
          <span className="stat-name">사교</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill social" style={{ width: `${animatedWidths.social}%` }} />
            </div>
          </div>
          <span className="stat-val">
            {stats.social}/{getTargetValue(stats.social)} (
            {Math.floor((stats.social / getTargetValue(stats.social)) * 100)}%)
          </span>
        </div>
        <div className="stat-row stat-variant-diligent">
          <span className="stat-icon">💪</span>
          <span className="stat-name">성실</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill diligent" style={{ width: `${animatedWidths.diligent}%` }} />
            </div>
          </div>
          <span className="stat-val">
            {stats.diligent}/{getTargetValue(stats.diligent)} (
            {Math.floor((stats.diligent / getTargetValue(stats.diligent)) * 100)}%)
          </span>
        </div>
        <div className="stat-row stat-variant-focus">
          <span className="stat-icon">🎯</span>
          <span className="stat-name">집중</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill focus" style={{ width: `${animatedWidths.focus}%` }} />
            </div>
          </div>
          <span className="stat-val">
            {stats.focus}/{getTargetValue(stats.focus)} ({Math.floor((stats.focus / getTargetValue(stats.focus)) * 100)}%)
          </span>
        </div>
        <div className="stat-row stat-variant-creative">
          <span className="stat-icon">💡</span>
          <span className="stat-name">창의</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-track">
              <div className="stat-bar-fill creative" style={{ width: `${animatedWidths.creative}%` }} />
            </div>
          </div>
          <span className="stat-val">
            {stats.creative}/{getTargetValue(stats.creative)} (
            {Math.floor((stats.creative / getTargetValue(stats.creative)) * 100)}%)
          </span>
        </div>
      </div>

      <div className="fatigue-section stats-modal-fatigue">
        <div className="fatigue-header">
          <span className="fatigue-title">오늘의 피로도</span>
          <span className="fatigue-val">
            {fatigue} / {MAX_FATIGUE}
          </span>
        </div>
        <div className="fatigue-bar-track">
          <div className="fatigue-bar-fill" style={{ width: `${animatedWidths.fatigue}%` }} />
        </div>
      </div>
      </div>
    </div>
  );
}

export default function StatsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="stats-modal-root">
      <button type="button" className="stats-modal-backdrop" aria-label="닫기" onClick={onClose} />
      <div
        className="stats-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stats-modal-header">
          <h2 id="stats-modal-title" className="stats-modal-title">
            나의 스탯
          </h2>
          <button type="button" className="stats-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="stats-modal-body">
          {/* StatsModalContent: 좌측 펫 + 우측 차트·목록 */}
          <StatsModalContent />
        </div>
      </div>
    </div>,
    document.body
  );
}
