/* =====================================================
   배틀 게임 로직 (battle.js)
   ===================================================== */

// ── 참여자 기본값 ──────────────────────────────────────
const BATTLE_DEFAULT_NAMES = [
  '윤기수','박명근','백용','배다영','이동희','고인수','지동근','신기원',
  '문다훈','조인혁','한수빈','서지훈','조상현','김민호','이기원',
  '이희수','오승진','김남주','이규빈','이찬민'
];

// ── 캐릭터 색상 팔레트 (마인크래프트풍) ────────────────
const CHAR_PALETTES = [
  { head:'#F4C57E', body:'#3B82F6', leg:'#1E3A5F' },
  { head:'#FBBF24', body:'#EF4444', leg:'#7F1D1D' },
  { head:'#F4C57E', body:'#10B981', leg:'#064E3B' },
  { head:'#FDE68A', body:'#8B5CF6', leg:'#4C1D95' },
  { head:'#F4C57E', body:'#F97316', leg:'#7C2D12' },
  { head:'#FBBF24', body:'#06B6D4', leg:'#164E63' },
  { head:'#F4C57E', body:'#EC4899', leg:'#831843' },
  { head:'#FDE68A', body:'#84CC16', leg:'#365314' },
  { head:'#F4C57E', body:'#6366F1', leg:'#312E81' },
  { head:'#FBBF24', body:'#14B8A6', leg:'#134E4A' },
  { head:'#F4C57E', body:'#F43F5E', leg:'#881337' },
  { head:'#FDE68A', body:'#A855F7', leg:'#581C87' },
  { head:'#F4C57E', body:'#22C55E', leg:'#14532D' },
  { head:'#FBBF24', body:'#3B82F6', leg:'#1E3A5F' },
  { head:'#F4C57E', body:'#FB923C', leg:'#7C2D12' },
  { head:'#FDE68A', body:'#38BDF8', leg:'#0C4A6E' },
  { head:'#F4C57E', body:'#E11D48', leg:'#881337' },
  { head:'#FBBF24', body:'#7C3AED', leg:'#4C1D95' },
  { head:'#F4C57E', body:'#059669', leg:'#064E3B' },
  { head:'#FDE68A', body:'#DC2626', leg:'#7F1D1D' },
];

// ── 액션 목록 ─────────────────────────────────────────
const BATTLE_ACTIONS = [
  { emoji:'🦵', text:'발차기' },
  { emoji:'👊', text:'주먹 지르기' },
  { emoji:'🌀', text:'공중제비' },
  { emoji:'💥', text:'박치기' },
  { emoji:'⚡', text:'번개 킥' },
  { emoji:'🌪️', text:'회오리 공격' },
  { emoji:'🔥', text:'파이어 펀치' },
  { emoji:'✨', text:'별 날리기' },
  { emoji:'🎯', text:'정밀 타격' },
  { emoji:'💫', text:'돌려차기' },
];

// ── 상태 변수 ─────────────────────────────────────────
let battleFighters     = [];   // { name, hp, maxHp, palette, eliminated }
let battleWinnersList  = [];   // 탈락 역순 → 최종 3명
let battleRound        = 0;
let battleAutoTimer    = null;
let battleIsRunning    = false;
let battleWinnersData  = [];   // [{ name, palette, rank, prize }]

// ── BGM (Web Audio API로 8비트 반복 멜로디) ──────────
let bgmCtx   = null;
let bgmNodes = [];
let bgmLoop  = null;

function buildBattleBGM() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  bgmCtx = new (window.AudioContext || window.webkitAudioContext)();

  // 간단한 8비트 멜로디 (도레미파솔 반복)
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66,
                 261.63, 261.63, 392.00, 392.00, 440.00, 392.00, 349.23, 329.63];
  const beatLen = 0.18;
  let startTime = bgmCtx.currentTime;

  function playMelody() {
    notes.forEach((freq, i) => {
      const osc  = bgmCtx.createOscillator();
      const gain = bgmCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, startTime + i * beatLen);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * beatLen + beatLen * 0.9);
      osc.connect(gain);
      gain.connect(bgmCtx.destination);
      osc.start(startTime + i * beatLen);
      osc.stop(startTime + i * beatLen + beatLen);
    });
    startTime += notes.length * beatLen;
    bgmLoop = setTimeout(playMelody, notes.length * beatLen * 1000 - 50);
  }
  playMelody();
}

function stopBattleBGM() {
  if (bgmLoop) { clearTimeout(bgmLoop); bgmLoop = null; }
  if (bgmCtx)  { bgmCtx.close(); bgmCtx = null; }
}

// ── 설정 화면 초기화 ──────────────────────────────────
function initBattleSetup() {
  const ta = document.getElementById('battleNameInput');
  if (ta) ta.value = BATTLE_DEFAULT_NAMES.join('\n');
}

// ── 이름 파싱 ─────────────────────────────────────────
function parseBattleNames() {
  const raw = document.getElementById('battleNameInput')?.value || '';
  return raw.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
}

// ── 캐릭터 스프라이트 HTML 생성 ───────────────────────
function makeSpriteHTML(palette, size = 1) {
  const w  = Math.round(36 * size);
  const h  = Math.round(52 * size);
  const hw = Math.round(28 * size);
  const hh = Math.round(28 * size);
  const bw = Math.round(22 * size);
  const bh = Math.round(16 * size);
  const bt = Math.round(26 * size);
  const lt = Math.round(40 * size);
  const lw = Math.round(9  * size);
  const lh = Math.round(12 * size);
  const at = Math.round(26 * size);
  const aw = Math.round(36 * size);
  const armW = Math.round(7 * size);
  const armH = Math.round(14 * size);
  const eyeW = Math.round(4 * size);
  const eyeH = Math.round(4 * size);
  const eyeG = Math.round(6 * size);
  const mW   = Math.round(8 * size);
  const mH   = Math.round(3 * size);

  return `
  <div class="fighter-sprite" style="width:${w}px;height:${h}px;">
    <div class="fighter-head" style="width:${hw}px;height:${hh}px;background:${palette.head};">
      <div class="fighter-face">
        <div class="fighter-eyes" style="gap:${eyeG}px;">
          <div class="fighter-eye" style="width:${eyeW}px;height:${eyeH}px;"></div>
          <div class="fighter-eye" style="width:${eyeW}px;height:${eyeH}px;"></div>
        </div>
        <div class="fighter-mouth" style="width:${mW}px;height:${mH}px;"></div>
      </div>
    </div>
    <div class="fighter-body" style="width:${bw}px;height:${bh}px;top:${bt}px;background:${palette.body};"></div>
    <div class="fighter-legs" style="top:${lt}px;">
      <div class="fighter-leg" style="width:${lw}px;height:${lh}px;background:${palette.leg};"></div>
      <div class="fighter-leg" style="width:${lw}px;height:${lh}px;background:${palette.leg};"></div>
    </div>
    <div class="fighter-arms" style="top:${at}px;width:${aw}px;">
      <div class="fighter-arm left"  style="width:${armW}px;height:${armH}px;background:${palette.body};"></div>
      <div class="fighter-arm right" style="width:${armW}px;height:${armH}px;background:${palette.body};"></div>
    </div>
  </div>`;
}

// ── 게임 시작 ─────────────────────────────────────────
function startBattleGame() {
  const names = parseBattleNames();
  if (names.length < 3) {
    alert('최소 3명 이상의 참여자가 필요합니다.');
    return;
  }

  // 파이터 초기화
  battleFighters = names.map((name, i) => ({
    name,
    hp: 100,
    maxHp: 100,
    palette: CHAR_PALETTES[i % CHAR_PALETTES.length],
    eliminated: false,
    id: i,
  }));
  battleWinnersList = [];
  battleWinnersData = [];
  battleRound = 0;
  battleIsRunning = false;
  if (battleAutoTimer) { clearTimeout(battleAutoTimer); battleAutoTimer = null; }

  showSlide('slide-battle');
  buildBattleArena();
  updateBattleUI();
  updateBattleLog('⚔️ 배틀 시작! 최후의 3인이 외식상품권을 받습니다!');

  // BGM 시작
  stopBattleBGM();
  buildBattleBGM();
}

// ── 아레나 렌더링 ─────────────────────────────────────
function buildBattleArena() {
  const arena = document.getElementById('battleArena');
  if (!arena) return;
  arena.innerHTML = battleFighters.map(f => `
    <div class="fighter" id="fighter-${f.id}" data-id="${f.id}">
      ${makeSpriteHTML(f.palette)}
      <div class="fighter-name">${f.name}</div>
      <div class="fighter-hp-bar">
        <div class="fighter-hp-fill" id="hp-${f.id}" style="width:100%;"></div>
      </div>
    </div>
  `).join('');
}

// ── UI 상태 업데이트 ──────────────────────────────────
function updateBattleUI() {
  const alive = battleFighters.filter(f => !f.eliminated);
  const rem   = document.getElementById('battleRemaining');
  if (rem) rem.textContent = `남은 인원: ${alive.length}명`;

  // HP 바 업데이트
  battleFighters.forEach(f => {
    const bar = document.getElementById(`hp-${f.id}`);
    if (bar) bar.style.width = `${Math.max(0, f.hp / f.maxHp * 100)}%`;
  });

  // 버튼 상태
  const btnNext = document.getElementById('btnBattleNext');
  const btnAuto = document.getElementById('btnBattleAuto');
  if (alive.length <= 3) {
    if (btnNext) btnNext.disabled = true;
    if (btnAuto) btnAuto.disabled = true;
  }
}

function updateBattleLog(text) {
  const log = document.getElementById('battleLog');
  if (log) log.innerHTML = `<div class="battle-log-text">${text}</div>`;
}

// ── 이펙트 표시 ───────────────────────────────────────
function showBattleEffect(fighterId, emoji) {
  const el = document.getElementById(`fighter-${fighterId}`);
  if (!el) return;
  const rect   = el.getBoundingClientRect();
  const arena  = document.getElementById('battleArena').getBoundingClientRect();
  const eff    = document.createElement('div');
  eff.className = 'battle-effect';
  eff.textContent = emoji;
  eff.style.left = `${rect.left - arena.left + rect.width / 2 - 12}px`;
  eff.style.top  = `${rect.top  - arena.top}px`;
  document.getElementById('battleArena').appendChild(eff);
  setTimeout(() => eff.remove(), 900);
}

// ── 한 라운드 전투 ────────────────────────────────────
function battleNextRound() {
  if (battleIsRunning) return;
  const alive = battleFighters.filter(f => !f.eliminated);
  if (alive.length <= 3) {
    endBattle();
    return;
  }

  battleIsRunning = true;
  const btnNext = document.getElementById('btnBattleNext');
  const btnAuto = document.getElementById('btnBattleAuto');
  if (btnNext) btnNext.disabled = true;
  if (btnAuto) btnAuto.disabled = true;

  battleRound++;

  // 타겟 선택: HP 최하위 + 랜덤
  const sorted = [...alive].sort((a, b) => a.hp - b.hp);
  const targetPool = sorted.slice(0, Math.ceil(alive.length / 3));
  const target = targetPool[Math.floor(Math.random() * targetPool.length)];

  // 공격자 선택 (인원 줄수록 여러명이 공격)
  const maxAttackers = Math.max(1, Math.floor((20 - alive.length) / 4) + 1);
  const attackers = alive
    .filter(f => f !== target)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(maxAttackers, alive.length - 1));

  // 데미지 계산
  const totalDmg = Math.floor(Math.random() * 30 + 20) * attackers.length;
  target.hp = Math.max(0, target.hp - totalDmg);

  // 액션 선택
  const action = BATTLE_ACTIONS[Math.floor(Math.random() * BATTLE_ACTIONS.length)];
  const attackerNames = attackers.map(a => a.name).join(', ');

  // 애니메이션 적용
  attackers.forEach(a => {
    const el = document.getElementById(`fighter-${a.id}`);
    if (el) { el.classList.add('attacking'); setTimeout(() => el.classList.remove('attacking'), 450); }
    showBattleEffect(a.id, action.emoji);
  });

  setTimeout(() => {
    const el = document.getElementById(`fighter-${target.id}`);
    if (el) { el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 450); }
    showBattleEffect(target.id, '💢');
    updateBattleUI();

    let logMsg = `${action.emoji} <b>${attackerNames}</b>이(가) <b>${target.name}</b>에게 ${action.text}! (-${totalDmg}HP)`;

    // 탈락 처리
    if (target.hp <= 0) {
      target.eliminated = true;
      const el2 = document.getElementById(`fighter-${target.id}`);
      if (el2) { el2.classList.add('eliminated'); }
      battleWinnersList.unshift(target);  // 탈락 순서 (마지막 탈락이 3위)
      showBattleEffect(target.id, '😵');
      logMsg += ` → <b>${target.name}</b> 탈락! 😵`;

      const aliveAfter = battleFighters.filter(f => !f.eliminated);

      // 3명 이하로 줄면 종료
      if (aliveAfter.length <= 3) {
        updateBattleLog(logMsg);
        setTimeout(() => endBattle(), 800);
        return;
      }
    }

    updateBattleLog(logMsg);

    battleIsRunning = false;
    if (btnNext) btnNext.disabled = false;
    if (btnAuto) btnAuto.disabled = false;
  }, 350);
}

// ── 자동 진행 ─────────────────────────────────────────
function battleAutoPlay() {
  const btnAuto = document.getElementById('btnBattleAuto');
  if (battleAutoTimer) {
    clearInterval(battleAutoTimer);
    battleAutoTimer = null;
    if (btnAuto) btnAuto.textContent = '🚀 자동 진행';
    return;
  }
  if (btnAuto) btnAuto.textContent = '⏹ 정지';
  battleAutoTimer = setInterval(() => {
    const alive = battleFighters.filter(f => !f.eliminated);
    if (alive.length <= 3) {
      clearInterval(battleAutoTimer);
      battleAutoTimer = null;
      return;
    }
    if (!battleIsRunning) battleNextRound();
  }, 700);
}

// ── 게임 종료 & 세레모니 ──────────────────────────────
function endBattle() {
  if (battleAutoTimer) { clearInterval(battleAutoTimer); battleAutoTimer = null; }
  stopBattleBGM();

  const alive = battleFighters.filter(f => !f.eliminated);
  // 살아있는 사람들을 최종 순위로 (HP 높은 순)
  const survivors = [...alive].sort((a, b) => b.hp - a.hp);

  const prize1 = parseInt(document.getElementById('battlePrize1')?.value || 40000);
  const prize2 = parseInt(document.getElementById('battlePrize2')?.value || 30000);
  const prize3 = parseInt(document.getElementById('battlePrize3')?.value || 20000);
  const prizes = [prize1, prize2, prize3];

  battleWinnersData = survivors.slice(0, 3).map((f, i) => ({
    name: f.name,
    palette: f.palette,
    rank: i + 1,
    prize: prizes[i] || 0,
  }));

  // 세레모니 슬라이드
  showBattleCeremony(true);
}

// ── 세레모니 표시 ─────────────────────────────────────
function showBattleCeremony(isFinal) {
  showSlide('slide-battle-ceremony');

  const title    = document.getElementById('ceremonyTitle');
  const subtitle = document.getElementById('ceremonySubtitle');
  const fightBox = document.getElementById('ceremonyFighters');
  const btn      = document.getElementById('btnCeremonyNext');

  const rankEmojis = ['🥇','🥈','🥉'];

  if (isFinal) {
    title.textContent    = '🎉 최종 우승자 발표!';
    subtitle.textContent = '축하합니다! 외식상품권 수령 대상자입니다 🎊';
    btn.textContent      = '🏆 최종 결과 보기';
    btn.onclick          = () => showBattleResult();
  }

  fightBox.innerHTML = battleWinnersData.map((w, i) => `
    <div class="ceremony-fighter-card" style="border-color:${w.palette.body}40;">
      <div class="ceremony-rank-badge">${rankEmojis[i]}</div>
      ${makeSpriteHTML(w.palette, 1.2)}
      <div class="ceremony-fighter-name" style="color:#fff;">${w.name}</div>
      <div style="color:#ffd700;font-weight:700;font-size:0.9rem;">${w.prize.toLocaleString()}원</div>
    </div>
  `).join('');

  // 컨페티 시작
  startCeremonyConfetti();
}

function battleContinue() {
  stopCeremonyConfetti();
  showBattleResult();
}

// ── 최종 결과 ─────────────────────────────────────────
function showBattleResult() {
  showSlide('slide-battle-result');
  const rankEmojis = ['🥇','🥈','🥉'];
  const winners = document.getElementById('battleWinners');
  winners.innerHTML = battleWinnersData.map((w, i) => `
    <div class="battle-winner-card">
      <div class="winner-rank">${rankEmojis[i]}</div>
      <div class="winner-sprite-wrap">${makeSpriteHTML(w.palette, 1)}</div>
      <div class="winner-info">
        <div class="winner-name">${w.name}</div>
        <div class="winner-prize">🎫 외식상품권 ${w.prize.toLocaleString()}원</div>
      </div>
    </div>
  `).join('');

  // 불꽃놀이
  startBattleFireworks();
}

// ── 컨페티 (세레모니) ─────────────────────────────────
let ceremonyConfettiAnim = null;

function startCeremonyConfetti() {
  const canvas = document.getElementById('ceremonyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({length: 120}, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height - canvas.height,
    r:    Math.random() * 6 + 3,
    color: `hsl(${Math.random()*360},80%,60%)`,
    vx:   Math.random() * 2 - 1,
    vy:   Math.random() * 3 + 2,
    va:   Math.random() * 4,
    angle:0,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += p.va;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    ceremonyConfettiAnim = requestAnimationFrame(draw);
  }
  draw();
}

function stopCeremonyConfetti() {
  if (ceremonyConfettiAnim) { cancelAnimationFrame(ceremonyConfettiAnim); ceremonyConfettiAnim = null; }
  const canvas = document.getElementById('ceremonyCanvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ── 불꽃놀이 (최종 결과) ──────────────────────────────
let battleFwAnim = null;
let battleFwParticles = [];

function startBattleFireworks() {
  const canvas = document.getElementById('battleFireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  function burst() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6;
    const hue = Math.random() * 360;
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = Math.random() * 5 + 2;
      battleFwParticles.push({
        x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        alpha: 1, color: `hsl(${hue},90%,60%)`, r: Math.random()*3+1,
      });
    }
  }

  let burstTimer = setInterval(burst, 600);

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    battleFwParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.alpha -= 0.015;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    battleFwParticles = battleFwParticles.filter(p => p.alpha > 0);
    battleFwAnim = requestAnimationFrame(draw);
  }
  draw();

  setTimeout(() => {
    clearInterval(burstTimer);
    setTimeout(() => {
      if (battleFwAnim) cancelAnimationFrame(battleFwAnim);
    }, 3000);
  }, 10000);
}

// ── DOMContentLoaded 초기화 ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBattleSetup();
});
