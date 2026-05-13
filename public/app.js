/* ============================================================
   CAMPUSQUEST — APP.JS (Stardew Valley Style)
   ============================================================ */

// ── 화면 전환 ──────────────────────────────────────────────
function goToScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // 스탯 화면 진입 시 바 애니메이션
    if (id === 'screenStats') animateStatBars();
  }
}

// ── 스탯 바 애니메이션 ─────────────────────────────────────
function animateStatBars() {
  const bars = document.querySelectorAll('#screenStats .stat-bar-fill');
  bars.forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 100);
  });
}

// ── 퀘스트 완료 ────────────────────────────────────────────
let questCount = 3;
const totalQuests = 5;

function completeQuest(el) {
  if (el.classList.contains('done') || el.classList.contains('completing')) return;

  el.classList.add('completing');
  const check = el.querySelector('.quest-check');
  const xpEl  = el.querySelector('.quest-xp');

  // 체크 표시 변경
  check.classList.remove('empty');
  check.textContent = '✓';

  // XP 뱃지 변경
  xpEl.textContent = '완료';
  xpEl.classList.add('done-badge');

  // 완료 스타일 적용
  setTimeout(() => {
    el.classList.remove('completing', 'active');
    el.classList.add('done');
  }, 400);

  questCount++;

  // 뱃지 업데이트
  const badge = document.querySelector('#screenHome .section-badge');
  if (badge) badge.textContent = `${questCount}/${totalQuests}`;

  // XP 증가
  addXP(150);

  // 토스트 표시
  showToast('퀘스트 완료! +150 XP');

  // 모든 퀘스트 완료 시 레벨업
  if (questCount >= totalQuests) {
    setTimeout(() => showLevelup(), 1200);
  }
}

// ── XP 증가 ────────────────────────────────────────────────
let currentXP = 1240;
const maxXP = 2000;

function addXP(amount) {
  currentXP = Math.min(currentXP + amount, maxXP);
  const pct = (currentXP / maxXP) * 100;
  const fill = document.querySelector('.xp-fill');
  const label = document.querySelector('.xp-label span:last-child');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = `${currentXP.toLocaleString()} / ${maxXP.toLocaleString()}`;
}

// ── 토스트 메시지 ──────────────────────────────────────────
function showToast(msg) {
  let toast = document.querySelector('.quest-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'quest-toast';
    document.getElementById('phoneScreen').appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── 레벨업 오버레이 ────────────────────────────────────────
function showLevelup() {
  const overlay = document.getElementById('levelupOverlay');
  if (overlay) overlay.classList.add('show');
  // 파티클 폭발 효과
  burstParticles();
}

function closeLevelup() {
  const overlay = document.getElementById('levelupOverlay');
  if (overlay) overlay.classList.remove('show');
}

// ── 배경 파티클 캔버스 (Fireflies / Leaves) ─────────────────
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

let W, H;
let particles = [];

function resize() {
  if (!canvas) return;
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Stardew Valley style - soft floating particles (fireflies, leaves, sparkles)
class Particle {
  constructor(burst = false, bx = 0, by = 0) {
    this.burst = burst;
    if (burst) {
      this.x  = bx;
      this.y  = by;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4 - 2;
      this.life = 1;
      this.decay = 0.015 + Math.random() * 0.02;
      this.size  = 3 + Math.random() * 5;
      // Warm, cozy colors
      const colors = ['#f5c06e', '#ffd700', '#b5e8c3', '#f8b4c4', '#a8d8ea'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      this.reset();
    }
  }

  reset() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.vx   = (Math.random() - 0.5) * 0.3;
    this.vy   = -0.1 - Math.random() * 0.2;
    this.size = 2 + Math.random() * 3;
    this.life = Math.random();
    this.maxLife = 0.5 + Math.random() * 0.5;
    // Use current season particle colors
    this.color = seasonParticleColors[Math.floor(Math.random() * seasonParticleColors.length)];
    this.twinkleSpeed = 0.02 + Math.random() * 0.03;
    this.twinklePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Gentle swaying motion
    this.x += Math.sin(this.life * 5 + this.twinklePhase) * 0.2;
    
    if (this.burst) {
      this.life -= this.decay;
      this.vy += 0.05; // Gravity
      this.vx *= 0.98;
      this.vy *= 0.98;
    } else {
      this.life += this.twinkleSpeed;
      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) {
        this.reset();
        this.y = H + 10;
      }
    }
  }

  draw() {
    const alpha = this.burst
      ? this.life
      : Math.sin((this.life / this.maxLife) * Math.PI) * 0.5 + 0.2;
    
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = this.color;
    
    // Soft glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.globalAlpha = Math.max(0, alpha * 0.8);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  isDead() {
    return this.burst && this.life <= 0;
  }
}

// Initial particles - fewer for cozy feel
for (let i = 0; i < 40; i++) particles.push(new Particle());

function burstParticles() {
  if (!canvas) return;
  const cx = W / 2, cy = H / 2;
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle(true, cx, cy));
  }
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  particles = particles.filter(p => !p.isDead());
  particles.forEach(p => { p.update(); p.draw(); });

  requestAnimationFrame(animateParticles);
}
if (ctx) animateParticles();

// ── 좌측 패널 스탯 바 애니메이션 ──────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.stat-bar-mini .fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      bar.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => { bar.style.width = w; }, 300);
    });
  }, 600);
});

// ── 폰 프레임 부드러운 패럴랙스 ─────────────────────────────
const phoneFrame = document.querySelector('.phone-frame');
const phoneGlow  = document.querySelector('.phone-glow');

document.addEventListener('mousemove', (e) => {
  const cx = W / 2, cy = H / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const rx = dy * 3;
  const ry = -dx * 3;

  if (phoneFrame) {
    phoneFrame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  if (phoneGlow) {
    phoneGlow.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
  }
});

document.addEventListener('mouseleave', () => {
  if (phoneFrame) phoneFrame.style.transform = '';
  if (phoneGlow)  phoneGlow.style.transform  = '';
});

// ── 계절 테마 전환 ─────────────────────────────────────────
const SEASONS = {
  spring: {
    skyTop:      '#a0d8f1',
    skyBot:      '#d4f0c8',
    groundColor: '#6dc44a',
    ground2:     '#56a836',
    hill1:       '#6dc44a',
    hill2:       '#6dc44a',
    hill3:       '#60b840',
    leafColors:  [['#ff8fab','#ffb7c5','#ff69a0'], ['#ff8fab','#ffb7c5','#ff69a0'],
                  ['#ffb7c5','#ffc8d5','#ff9eb5'], ['#ff8fab','#ffb7c5','#ff69a0'],
                  ['#ffaac0','#ffc0d0','#ff90b0'], ['#ffb7c5','#ffc8d5','#ff9eb5']],
    trunkColor:  '#6b4226',
    showPetals:  true,
    showAutumn:  false,
    showSnow:    false,
    snowGround:  0,
    particles:   ['#ffb7c5','#ff9eb5','#ffc8d5','#fff0f5','#ffe4ed'],
    cloudOpacity:'0.8',
    bgBody:      '#b8e0f7',
  },
  summer: {
    skyTop:      '#4fb3e8',
    skyBot:      '#a8d870',
    groundColor: '#4a9e30',
    ground2:     '#3a8020',
    hill1:       '#4a9e30',
    hill2:       '#4a9e30',
    hill3:       '#429628',
    leafColors:  [['#2d7a1f','#3e9030','#4da83c'], ['#2d7a1f','#3e9030','#4da83c'],
                  ['#347824','#469838','#58b04a'], ['#2d7a1f','#3e9030','#4da83c'],
                  ['#327020','#449034','#56a846'], ['#3a7a24','#4c9038','#5ea84a']],
    trunkColor:  '#5a3015',
    showPetals:  false,
    showAutumn:  false,
    showSnow:    false,
    snowGround:  0,
    particles:   ['#b5e8c3','#ffd700','#a8e8a0','#d4f0a0','#fff8b0'],
    cloudOpacity:'0.65',
    bgBody:      '#6ab8e8',
  },
  autumn: {
    skyTop:      '#e8b868',
    skyBot:      '#c8a850',
    groundColor: '#8b7040',
    ground2:     '#705830',
    hill1:       '#8b7040',
    hill2:       '#8b7040',
    hill3:       '#806838',
    leafColors:  [['#a84000','#c85800','#e87020'], ['#a84000','#c85800','#e87020'],
                  ['#b05000','#cc6800','#e88030'], ['#9a4800','#b86000','#d07820'],
                  ['#b05800','#c87000','#e08838'], ['#a04000','#bc5800','#d87028']],
    trunkColor:  '#4a2810',
    showPetals:  false,
    showAutumn:  true,
    showSnow:    false,
    snowGround:  0,
    particles:   ['#e8640a','#d4500a','#cc8800','#e85000','#c8a000'],
    cloudOpacity:'0.5',
    bgBody:      '#e8c490',
  },
  winter: {
    skyTop:      '#b0cce8',
    skyBot:      '#d8eaf8',
    groundColor: '#d0e8f4',
    ground2:     '#b8d4ec',
    hill1:       '#c8e0f0',
    hill2:       '#c8e0f0',
    hill3:       '#bcd8ec',
    leafColors:  [['#7a9db8','#8db0c8','#a0c0d8'], ['#7a9db8','#8db0c8','#a0c0d8'],
                  ['#82a5c0','#94b8d0','#a6c8e0'], ['#7a9db8','#8db0c8','#a0c0d8'],
                  ['#7898b4','#8aaccc','#9cbce0'], ['#809ab8','#90acd0','#a0bce0']],
    trunkColor:  '#3a2810',
    showPetals:  false,
    showAutumn:  false,
    showSnow:    true,
    snowGround:  1,
    particles:   ['#ffffff','#d8eeff','#c8e4ff','#eef6ff','#b8d8ff'],
    cloudOpacity:'0.9',
    bgBody:      '#c8ddf0',
  },
};

let currentSeason = 'spring';

function setSeason(season) {
  if (currentSeason === season) return;
  currentSeason = season;

  const cfg = SEASONS[season];

  // body 클래스
  document.body.className = `season-${season}`;

  // 버튼 active
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.season === season);
  });

  // SVG 하늘 그라디언트
  const skyTop = document.getElementById('skyTop');
  const skyBot = document.getElementById('skyBot');
  if (skyTop) skyTop.setAttribute('stop-color', cfg.skyTop);
  if (skyBot) skyBot.setAttribute('stop-color', cfg.skyBot);

  // 지면 색상
  const gr  = document.getElementById('groundRect');
  const gr2 = document.getElementById('groundRect2');
  const h1  = document.getElementById('hill1');
  const h2  = document.getElementById('hill2');
  const h3  = document.getElementById('hill3');
  if (gr)  gr.setAttribute('fill', cfg.groundColor);
  if (gr2) gr2.setAttribute('fill', cfg.ground2);
  if (h1)  h1.setAttribute('fill', cfg.hill1);
  if (h2)  h2.setAttribute('fill', cfg.hill2);
  if (h3)  h3.setAttribute('fill', cfg.hill3);

  // 나뭇잎 색상 (6개 나무, 각 2~3개 레이어)
  const leafIds = [
    ['leaf1c','leaf1b','leaf1a'],
    ['leaf2c','leaf2b','leaf2a'],
    ['leaf3c','leaf3b'],
    ['leaf4c','leaf4b','leaf4a'],
    ['leaf5c','leaf5b','leaf5a'],
    ['leaf6c','leaf6b'],
  ];
  leafIds.forEach((group, gi) => {
    group.forEach((id, li) => {
      const el = document.getElementById(id);
      if (el && cfg.leafColors[gi] && cfg.leafColors[gi][li]) {
        el.setAttribute('fill', cfg.leafColors[gi][li]);
      }
    });
  });

  // 줄기 색상
  ['trunk1','trunk2','trunk3','trunk4','trunk5','trunk6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('fill', cfg.trunkColor);
  });

  // 봄 꽃잎
  const petals = document.getElementById('petalGroup');
  if (petals) petals.setAttribute('opacity', cfg.showPetals ? '1' : '0');

  // 가을 낙엽
  const autLeaves = document.getElementById('autumnLeaves');
  if (autLeaves) autLeaves.setAttribute('opacity', cfg.showAutumn ? '1' : '0');

  // 겨울 눈모자
  const snowCaps = document.getElementById('snowCaps');
  if (snowCaps) snowCaps.setAttribute('opacity', cfg.showSnow ? '1' : '0');

  // 겨울 눈 지면
  const snowGround = document.getElementById('snowGround');
  if (snowGround) snowGround.setAttribute('opacity', String(cfg.snowGround));

  // 구름 투명도
  const cloudGroup = document.querySelector('.cloud-group');
  if (cloudGroup) cloudGroup.setAttribute('opacity', cfg.cloudOpacity);

  // 파티클 색상 업데이트
  seasonParticleColors = cfg.particles;
  particles.forEach(p => {
    if (!p.burst) {
      p.color = seasonParticleColors[Math.floor(Math.random() * seasonParticleColors.length)];
    }
  });
}

// 파티클 색상을 계절별로 제어
let seasonParticleColors = SEASONS.spring.particles;

// 초기 봄 세팅
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('season-spring');
  setSeason('spring');
});

// ── 사이드 패널 아이콘 부드러운 반짝임 ───────────────────────
setInterval(() => {
  const icons = document.querySelectorAll('.fi');
  const random = icons[Math.floor(Math.random() * icons.length)];
  if (random) {
    random.style.opacity = '0.7';
    random.style.transform = 'scale(1.2) rotate(5deg)';
    setTimeout(() => {
      random.style.opacity = '';
      random.style.transform = '';
    }, 800);
  }
}, 2000);
