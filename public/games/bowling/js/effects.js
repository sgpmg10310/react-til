// ======================================================
// 볼링 조추첨 - 시각 효과 모음
// ======================================================

// ── 별 배경 파티클 ──────────────────────────────────
let starAnimId = null;
function startStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    a: Math.random(),
    da: (Math.random() - 0.5) * 0.012,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.x = (s.x + s.dx + canvas.width)  % canvas.width;
      s.y = (s.y + s.dy + canvas.height) % canvas.height;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
    starAnimId = requestAnimationFrame(draw);
  }
  draw();
}

// ── 컨페티 ──────────────────────────────────────────
const CONFETTI_COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#A78BFA','#FF9F43','#48dbfb','#ff9ff3'];
let confettiAnimIds = {};

function startConfetti(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: Math.random() * 14 + 6,
    h: Math.random() * 7 + 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.12,
    dy: Math.random() * 3 + 2,
    dx: (Math.random() - 0.5) * 1.5,
    opacity: 1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    pieces.forEach(p => {
      p.y += p.dy;
      p.x += p.dx;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height * 0.7) p.opacity -= 0.012;
      if (p.opacity > 0 && p.y < canvas.height + 20) {
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive > 0) confettiAnimIds[canvasId] = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── 폭죽 ────────────────────────────────────────────
let fwAnimId = null;
let fwParticles = [];

function startFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  fwParticles = [];
  let burst = 0;

  function addBurst() {
    const x = canvas.width  * (0.2 + Math.random() * 0.6);
    const y = canvas.height * (0.1 + Math.random() * 0.5);
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 / 60) * i;
      const speed = Math.random() * 6 + 2;
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        r: Math.random() * 3 + 1,
      });
    }
  }

  // 첫 3연발
  addBurst();
  setTimeout(addBurst, 400);
  setTimeout(addBurst, 800);

  // 이후 반복
  const intervalId = setInterval(() => {
    burst++;
    addBurst();
    if (burst > 8) clearInterval(intervalId);
  }, 1200);

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fwParticles = fwParticles.filter(p => p.alpha > 0);
    fwParticles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.06; // gravity
      p.alpha -= 0.016;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    fwAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopFireworks() {
  if (fwAnimId) cancelAnimationFrame(fwAnimId);
  fwParticles = [];
  const c = document.getElementById('fireworksCanvas');
  if (c) c.getContext('2d').clearRect(0,0,c.width,c.height);
}

// ══════════════════════════════════════════════════════
// ── 볼링 BGM & 효과음 (Web Audio API)
// ══════════════════════════════════════════════════════
let bowlingAudioCtx   = null;
let bowlingBgmTimer   = null;
let bowlingBgmRunning = false;

function getBowlingAudioCtx() {
  if (!bowlingAudioCtx || bowlingAudioCtx.state === 'closed') {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    bowlingAudioCtx = new AC();
  }
  if (bowlingAudioCtx.state === 'suspended') bowlingAudioCtx.resume();
  return bowlingAudioCtx;
}

// ── 볼링 BGM: 경쾌한 8비트 멜로디 루프 ──────────────
function startBowlingBGM() {
  if (bowlingBgmRunning) return;
  if (bowlingBgmTimer) {
    clearTimeout(bowlingBgmTimer);
    bowlingBgmTimer = null;
  }
  const ctx = getBowlingAudioCtx();
  if (!ctx) return;
  bowlingBgmRunning = true;

  // 도-도-솔-솔-라-라-솔 파-파-미-미-레-레-도 (반짝반짝 리듬감 있게)
  const melody = [
    {f:523.25,d:0.18},{f:523.25,d:0.18},{f:783.99,d:0.18},{f:783.99,d:0.18},
    {f:880.00,d:0.18},{f:880.00,d:0.18},{f:783.99,d:0.35},
    {f:698.46,d:0.18},{f:698.46,d:0.18},{f:659.25,d:0.18},{f:659.25,d:0.18},
    {f:587.33,d:0.18},{f:587.33,d:0.18},{f:523.25,d:0.35},
    {f:783.99,d:0.18},{f:783.99,d:0.18},{f:698.46,d:0.18},{f:698.46,d:0.18},
    {f:659.25,d:0.18},{f:659.25,d:0.18},{f:587.33,d:0.35},
    {f:783.99,d:0.18},{f:783.99,d:0.18},{f:698.46,d:0.18},{f:698.46,d:0.18},
    {f:659.25,d:0.18},{f:659.25,d:0.18},{f:587.33,d:0.35},
    {f:523.25,d:0.18},{f:523.25,d:0.18},{f:783.99,d:0.18},{f:783.99,d:0.18},
    {f:880.00,d:0.18},{f:880.00,d:0.18},{f:783.99,d:0.35},
    {f:698.46,d:0.18},{f:698.46,d:0.18},{f:659.25,d:0.18},{f:659.25,d:0.18},
    {f:587.33,d:0.18},{f:587.33,d:0.18},{f:523.25,d:0.50},
  ];

  let loopStartTime = ctx.currentTime;

  function scheduleMelody(startAt) {
    let t = startAt;
    melody.forEach(note => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + note.d);
      t += note.d;
    });
    return t - startAt; // 총 길이
  }

  const totalLen = scheduleMelody(loopStartTime);

  // 다음 루프는 한 멜로디가 끝난 뒤에만 (겹침 방지 — 이전에 -0.1초로 겹쳐 소리가 중복됨)
  const loopDelayMs = Math.max(50, Math.ceil(totalLen * 1000) + 30);

  function loopBGM() {
    if (!bowlingBgmRunning) return;
    loopStartTime += totalLen;
    scheduleMelody(loopStartTime);
    bowlingBgmTimer = setTimeout(loopBGM, loopDelayMs);
  }
  bowlingBgmTimer = setTimeout(loopBGM, loopDelayMs);
}

function stopBowlingBGM() {
  bowlingBgmRunning = false;
  if (bowlingBgmTimer) {
    clearTimeout(bowlingBgmTimer);
    bowlingBgmTimer = null;
  }
  // suspend만 하면 스케줄된 오실레이터가 그대로 남아, 다시 켤 때 resume + 새 멜로디가 겹침 → close로 완전히 제거
  try {
    if (bowlingAudioCtx) {
      const ac = bowlingAudioCtx;
      bowlingAudioCtx = null;
      if (ac.state !== 'closed') ac.close();
    }
  } catch (e) {}
}

// ── 폭죽 효과음 (추첨 결과 시) ───────────────────────
function playFireworkSound() {
  const ctx = getBowlingAudioCtx();
  if (!ctx) return;

  function boom(delay, freq, dur) {
    const osc    = ctx.createOscillator();
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.5;

    // 노이즈 버퍼
    const bufSize = ctx.sampleRate * dur;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const t = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // 피치 상승 오실레이터
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(300 + freq, t + 0.05);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    src.connect(filter);
    filter.connect(gain);
    osc.connect(gain);
    gain.connect(ctx.destination);

    src.start(t); src.stop(t + dur);
    osc.start(t); osc.stop(t + 0.3);
  }

  // 3연발 + 추가 2발
  boom(0.0,  200, 0.5);
  boom(0.3,  350, 0.4);
  boom(0.6,  150, 0.6);
  boom(1.2,  280, 0.5);
  boom(1.8,  420, 0.4);
}

// ── BGM 상태 토글 버튼 업데이트 ──────────────────────
function updateBGMBtn() {
  const btn = document.getElementById('btnBGMToggle');
  if (!btn) return;
  btn.textContent = bowlingBgmRunning ? '🔇 BGM OFF' : '🎵 BGM ON';
  btn.classList.toggle('bgm-on', bowlingBgmRunning);
}

function toggleBowlingBGM() {
  if (bowlingBgmRunning) {
    stopBowlingBGM();
  } else {
    startBowlingBGM();
  }
  updateBGMBtn();
}
