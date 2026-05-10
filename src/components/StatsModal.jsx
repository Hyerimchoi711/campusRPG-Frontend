import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const TAU = Math.PI * 2;

/** 건강·사교·성실·집중·창의 — 레이더 꼭짓점·라벨·글로우 동일 순서 */
const RADAR_AXIS_PALETTE = [
  {
    point: '#5eead4',
    pointBorder: '#0d9488',
    pointHover: '#99f6e4',
    glowCore: 'rgba(45, 212, 191, 0.55)',
    glowEdge: 'rgba(45, 212, 191, 0.08)',
    label: '#0f766e',
    labelStroke: 'rgba(255, 252, 248, 0.92)',
    twinkleStroke: 'rgba(20, 184, 166, 0.85)',
    twinkleGlow: 'rgba(94, 234, 212, 0.75)',
    twinkleFill: '#134e4a',
    twinkleSheen: 'rgba(204, 251, 241, 0.55)',
  },
  {
    point: '#fbcfe8',
    pointBorder: '#be185d',
    pointHover: '#fce7f3',
    glowCore: 'rgba(244, 114, 182, 0.52)',
    glowEdge: 'rgba(244, 114, 182, 0.1)',
    label: '#9d174d',
    labelStroke: 'rgba(255, 252, 248, 0.92)',
    twinkleStroke: 'rgba(236, 72, 153, 0.85)',
    twinkleGlow: 'rgba(251, 207, 232, 0.8)',
    twinkleFill: '#831843',
    twinkleSheen: 'rgba(252, 231, 243, 0.55)',
  },
  {
    point: '#fde047',
    pointBorder: '#b45309',
    pointHover: '#fef08a',
    glowCore: 'rgba(250, 204, 21, 0.5)',
    glowEdge: 'rgba(250, 204, 21, 0.1)',
    label: '#92400e',
    labelStroke: 'rgba(255, 252, 248, 0.92)',
    twinkleStroke: 'rgba(217, 119, 6, 0.88)',
    twinkleGlow: 'rgba(253, 224, 71, 0.78)',
    twinkleFill: '#713f12',
    twinkleSheen: 'rgba(254, 249, 195, 0.55)',
  },
  {
    point: '#7dd3fc',
    pointBorder: '#0369a1',
    pointHover: '#bae6fd',
    glowCore: 'rgba(56, 189, 248, 0.5)',
    glowEdge: 'rgba(56, 189, 248, 0.1)',
    label: '#075985',
    labelStroke: 'rgba(255, 252, 248, 0.92)',
    twinkleStroke: 'rgba(14, 165, 233, 0.85)',
    twinkleGlow: 'rgba(125, 211, 252, 0.78)',
    twinkleFill: '#0c4a6e',
    twinkleSheen: 'rgba(224, 242, 254, 0.55)',
  },
  {
    point: '#fdba74',
    pointBorder: '#c2410c',
    pointHover: '#fed7aa',
    glowCore: 'rgba(251, 146, 60, 0.52)',
    glowEdge: 'rgba(251, 146, 60, 0.1)',
    label: '#9a3412',
    labelStroke: 'rgba(255, 252, 248, 0.92)',
    twinkleStroke: 'rgba(234, 88, 12, 0.88)',
    twinkleGlow: 'rgba(253, 186, 116, 0.78)',
    twinkleFill: '#7c2d12',
    twinkleSheen: 'rgba(255, 237, 213, 0.55)',
  },
];

/** 레이더만: 양피지·브라운 (다각형·그리드) */
const STATS_RADAR_THEME = {
  polygonFill: 'rgba(255, 244, 224, 0.42)',
  polygonStroke: 'rgba(92, 72, 52, 0.82)',
  grid: 'rgba(101, 78, 55, 0.22)',
  angle: 'rgba(101, 78, 55, 0.34)',
};

/** Canvas 라벨: 전역과 동일 (--body-font, 캔버스는 var() 전개 필요) */
function getRadarCanvasFontString() {
  if (typeof document === 'undefined') return "700 14px 'Jua', sans-serif";
  let raw = getComputedStyle(document.documentElement).getPropertyValue('--body-font');
  raw = raw.trim();
  if (!raw) raw = "'Jua', sans-serif";
  return `700 14px ${raw}`;
}

function isStatsRadarGlowEnabled(chart) {
  return Boolean(chart.options?.plugins?.statsRadarMonoGlow ?? chart.config?.options?.plugins?.statsRadarMonoGlow);
}

/** 레이더 축 i, 값 v일 때 꼭짓점 좌표 (Chart.js 기본 startAngle -90°와 동일) */
function radarAxisPoint(scale, index, value) {
  const chart = scale.chart;
  const n = chart.data.labels.length || 5;
  const start = typeof scale.options.startAngle === 'number' ? scale.options.startAngle : -Math.PI / 2;
  const angle = start + (TAU * index) / n;
  const max = scale.max > 0 ? scale.max : 100;
  const r = (Number(value) / max) * scale.drawingArea;
  return {
    x: scale.xCenter + Math.cos(angle) * r,
    y: scale.yCenter + Math.sin(angle) * r,
  };
}

/** 축 바깥쪽 라벨 위치 */
function radarLabelPosition(scale, index, padding = 18) {
  const chart = scale.chart;
  const n = chart.data.labels.length || 5;
  const start = typeof scale.options.startAngle === 'number' ? scale.options.startAngle : -Math.PI / 2;
  const angle = start + (TAU * index) / n;
  const r = scale.drawingArea + padding;
  return {
    x: scale.xCenter + Math.cos(angle) * r,
    y: scale.yCenter + Math.sin(angle) * r,
  };
}

/**
 * 단색 발광 레이더 + 최고 스탯 라벨 반짝임 (Canvas).
 * 기본 pointLabels는 끄고 여기서만 그림.
 */
const statsRadarMonoGlowPlugin = {
  id: 'statsRadarMonoGlow',
  order: 1000,
  beforeDatasetsDraw(chart) {
    if (!isStatsRadarGlowEnabled(chart)) return;
    const scale = chart.scales.r;
    const ctx = chart.ctx;
    if (!scale || !chart.data.datasets[0]) return;

    const raw = chart.data.datasets[0].data.map(Number);
    ctx.save();
    raw.forEach((value, i) => {
      const pos = radarAxisPoint(scale, i, value);
      const pal = RADAR_AXIS_PALETTE[i % RADAR_AXIS_PALETTE.length];
      const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 24);
      g.addColorStop(0, pal.glowCore);
      g.addColorStop(0.5, pal.glowEdge);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 24, 0, TAU);
      ctx.fill();

      ctx.shadowColor = pal.glowCore;
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.restore();
  },
  afterDraw(chart) {
    if (!isStatsRadarGlowEnabled(chart)) return;
    const scale = chart.scales.r;
    const ctx = chart.ctx;
    const labels = chart.data.labels;
    if (!scale || !labels?.length || !chart.data.datasets[0]) return;

    const raw = chart.data.datasets[0].data.map(Number);
    const maxVal = Math.max(...raw);
    const t = performance.now() / 1000;

    ctx.save();
    ctx.font = getRadarCanvasFontString();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;

    for (let i = 0; i < labels.length; i++) {
      let { x, y } = radarLabelPosition(scale, i, 16);
      /* 12시 건강 라벨 클립 방지 */
      if (i === 0) {
        y += 12;
      }
      const label = String(labels[i]);
      const isMax = maxVal > 0 && Number(raw[i]) === maxVal;
      /* 느린 흰색 반짝 (약 6~7초 주기) */
      const slow = 0.5 + 0.5 * Math.sin(t * 0.95 + i * 0.45);
      const gleam = 0.06 + (isMax ? 0.34 : 0.24) * slow;

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.strokeText(label, x, y);
      ctx.fillStyle = '#070707';
      ctx.fillText(label, x, y);
      ctx.fillStyle = `rgba(255, 255, 255, ${gleam})`;
      ctx.fillText(label, x, y);
    }
    ctx.restore();
  },
};

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  statsRadarMonoGlowPlugin
);

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

  const chartRef = useRef(null);
  /** 초기 차트 애니메이션 완료 후에만 shimmer용 update('none') */
  const radarAnimDoneRef = useRef(false);

  useEffect(() => {
    radarAnimDoneRef.current = false;
    const fallback = window.setTimeout(() => {
      radarAnimDoneRef.current = true;
    }, 1200);
    return () => window.clearTimeout(fallback);
  }, [stats.health, stats.social, stats.diligent, stats.focus, stats.creative]);

  useEffect(() => {
    let raf;
    const loop = () => {
      if (!document.hidden && radarAnimDoneRef.current) {
        chartRef.current?.update('none');
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const chartData = useMemo(
    () => ({
      labels: ['건강', '사교', '성실', '집중', '창의'],
      datasets: [
        {
          label: '내 스탯',
          data: [stats.health, stats.social, stats.diligent, stats.focus, stats.creative],
          fill: true,
          clip: false,
          backgroundColor: STATS_RADAR_THEME.polygonFill,
          borderColor: STATS_RADAR_THEME.polygonStroke,
          borderWidth: 2,
          pointBackgroundColor: RADAR_AXIS_PALETTE.map((p) => p.point),
          pointBorderColor: RADAR_AXIS_PALETTE.map((p) => p.pointBorder),
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: RADAR_AXIS_PALETTE.map((p) => p.pointHover),
          pointHoverBorderColor: RADAR_AXIS_PALETTE.map((p) => p.pointBorder),
        },
      ],
    }),
    [stats.health, stats.social, stats.diligent, stats.focus, stats.creative]
  );

  const chartOptions = useMemo(
    () => ({
      animation: {
        duration: 820,
        easing: 'easeOutQuart',
        onComplete: () => {
          radarAnimDoneRef.current = true;
        },
      },
      layout: {
        padding: { top: 34, bottom: 24, left: 14, right: 14 },
      },
      scales: {
        r: {
          startAngle: -Math.PI / 2,
          angleLines: {
            display: true,
            color: STATS_RADAR_THEME.angle,
            lineWidth: 1,
          },
          grid: {
            color: STATS_RADAR_THEME.grid,
            lineWidth: 1,
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false, stepSize: 25 },
          pointLabels: {
            display: false,
            backdropColor: 'transparent',
          },
        },
      },
      elements: {
        line: {
          borderJoinStyle: 'round',
        },
      },
      plugins: { legend: { display: false }, statsRadarMonoGlow: true },
      maintainAspectRatio: false,
    }),
    []
  );

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
        <Radar ref={chartRef} data={chartData} options={chartOptions} />
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
