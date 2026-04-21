// ======================================================
// 볼링 조추첨 프로그램 — 동적 설정 버전
// ======================================================

// ── 기본값 (설정 화면에서 변경 가능) ─────────────────
const DEFAULT_NAMES = [
  '배다영','이동희','윤기수','고인수',
  '지동근','한수빈','조인혁','문다훈',
  '서지훈','조상현','김민호','이기원',
  '김남주','이희수','이찬민','오승진',
  '이규빈','백용'
];
const DEFAULT_PROS    = ['오승진','조상현','이규빈','이동희'];
const DEFAULT_NOVICES = ['조인혁','이찬민','배다영','한수빈','김남주','이희수'];
const DEFAULT_PRIZES  = ['35만원','25만원','20만원'];

// ── 런타임 설정 (startFromSetup() 에서 채워짐) ────────
let CFG = {
  teamCount : 3,
  laneCount : 4,   // 최소 4레인
  perTeam   : 6,
  names     : [...DEFAULT_NAMES],
  pros      : [...DEFAULT_PROS],
  novices   : [...DEFAULT_NOVICES],
  prizes    : [...DEFAULT_PRIZES],
  bonusGame : 'doll', // 'doll' | 'timer'
};

// 팀 색상/이름/이모지 (최대 6팀)
const ALL_TEAM_COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#A78BFA','#FF9F43','#48dbfb'];
const ALL_TEAM_NAMES  = ['A조','B조','C조','D조','E조','F조'];
const ALL_TEAM_EMOJIS = ['🔴','🔵','🟡','🟣','🟠','🔷'];

// 런타임 팀 배열
let TEAM_COLORS = [];
let TEAM_NAMES  = [];
let TEAM_EMOJIS = [];

let teams         = [];
let rawTeams      = [];
let gameMode      = 1;
let pickIndex     = 0;
let shuffledNames = [];
let isAutoMode    = false;
let isPicking     = false;
let balanceSwapLog = [];

// ── 10초 게임 상태 ────────────────────────────────────
let timerRecords     = {}; // { teamIdx: seconds }
let timerRunning     = false;
let timerStart       = 0;
let timerInterval    = null;
let timerCurrentTeam = -1;
let timerVoiceEnabled = false;
let timerVoiceRec     = null;
let timerVoiceMediaStream = null;
let timerVoiceRestartTimer = null;
const IS_APPLE_TOUCH_DEVICE = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let bonusGameDoll  = true;  // 인형뽑기 선택 여부
let bonusGameTimer = true;  // 10초 맞추기 선택 여부
let timerActiveTeam  = -1;     // 현재 활성 팀 (스페이스바 연동)
/** 팀별 인형뽑기 시뮬 대표 이름 (teams[i]에 포함된 멤버) — 볼링 앱 상태에 저장 */
let clawRepByTeam = [];

// ══════════════════════════════════════════════════════
// ── 설정 화면 로직 ─────────────────────────────────────
// ══════════════════════════════════════════════════════
const NUM_LIMITS = { teamCount:[3,4], laneCount:[4,8], perTeam:[2,20] };

function adjNum(id, delta) {
  const el  = document.getElementById(id);
  const [mn, mx] = NUM_LIMITS[id];
  let val = parseInt(el.textContent) + delta;
  val = Math.max(mn, Math.min(mx, val));
  // 레인 수는 반드시 짝수 — 홀수 방향으로 이동 시 한 칸 더 이동
  if (id === 'laneCount' && val % 2 !== 0) {
    val += delta > 0 ? 1 : -1;
    val = Math.max(mn, Math.min(mx, val));
  }
  el.textContent = val;
  updateSetupUI();
}

function updateSetupUI() {
  const tc = parseInt(document.getElementById('teamCount').textContent);
  const actualNames = getNameList();
  const actual = actualNames.length;
  const totalEl = document.getElementById('setupTotal');

  if (actual > 0) {
    const base = Math.floor(actual / tc);
    const rem  = actual % tc;
    const distDesc = rem > 0
      ? `${base+1}명 × ${rem}팀, ${base}명 × ${tc - rem}팀`
      : `${base}명 × ${tc}팀`;
    totalEl.innerHTML = `총 <strong style="color:var(--neon)">${actual}명</strong> → 자동 배분: ${distDesc}`;
  } else {
    totalEl.textContent = `총 0명`;
  }

  // 시상 금액 행 업데이트
  const prizeRow = document.getElementById('prizeRow');
  const existing = prizeRow.querySelectorAll('input[data-prize]');
  // 기존 입력값 보존
  const vals = Array.from(existing).map(el => el.value);
  prizeRow.innerHTML = Array.from({length: tc}, (_, i) => {
    const rank  = ['1등','2등','3등','4등','5등','6등'][i];
    const medal = ['🥇','🥈','🥉','🏅','🏅','🏅'][i];
    const def   = DEFAULT_PRIZES[i] || `${Math.max(10, 35 - i*10)}만원`;
    const v     = vals[i] !== undefined ? vals[i] : def;
    return `<div class="prize-input-wrap">
      <label>${medal} ${rank}</label>
      <input type="text" data-prize="${i}" class="prize-input" value="${v}" placeholder="예) 35만원"/>
    </div>`;
  }).join('');

  // 스킬 칩 재렌더 (이름 목록 기반)
  renderSkillChips();
}

function getNameList() {
  const raw = document.getElementById('nameInput').value;
  return raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
}

function renderSkillChips() {
  const names = getNameList();
  ['prosChips','novicesChips'].forEach((cid, idx) => {
    const container = document.getElementById(cid);
    const type = idx === 0 ? 'pro' : 'novice';
    const defaults = idx === 0 ? DEFAULT_PROS : DEFAULT_NOVICES;

    // 현재 활성화된 이름 목록 저장 (칩이 아직 없으면 DEFAULT 사용)
    const existingChips = container.querySelectorAll('.skill-chip');
    const prevActive = existingChips.length > 0
      ? new Set(Array.from(existingChips)
          .filter(el => el.classList.contains('active'))
          .map(el => el.dataset.name))
      : new Set(defaults); // 초기 상태: DEFAULT 값으로 채움

    container.innerHTML = names.map(n => {
      const isActive = prevActive.has(n);
      return `<button class="skill-chip ${isActive ? 'active' : ''}" data-name="${n}" data-type="${type}"
                onclick="toggleSkill(this)">${n}</button>`;
    }).join('');
  });
}

function toggleSkill(btn) {
  // 같은 이름이 반대쪽에 있으면 먼저 제거
  const name = btn.dataset.name;
  const otherCid = btn.dataset.type === 'pro' ? 'novicesChips' : 'prosChips';
  const other = document.querySelector(`#${otherCid} [data-name="${name}"]`);
  if (other) other.classList.remove('active');
  btn.classList.toggle('active');
}

// 배틀 게임 → 볼링 순서로 이동
function goToBattle() {
  showSlide('slide-battle-setup');
  if (typeof initBattleSetup === 'function') initBattleSetup();
}

function startFromSetup() {
  const tc  = parseInt(document.getElementById('teamCount').textContent);
  const lc  = parseInt(document.getElementById('laneCount').textContent);
  const names = getNameList();
  const errEl = document.getElementById('setupError');

  // 최소 인원 검사 (팀당 최소 2명)
  if (names.length < tc * 2) {
    errEl.textContent = `⚠️ 이름이 너무 적습니다. 팀당 최소 2명 필요 (현재 ${names.length}명, 필요 최소 ${tc * 2}명)`;
    return;
  }
  errEl.textContent = '';

  // 실제 이름 수 기준으로 팀당 인원 재계산 (균등 배분)
  const pt = Math.ceil(names.length / tc); // UI 표시용 (최대팀 기준)

  const pros    = Array.from(document.querySelectorAll('#prosChips .skill-chip.active')).map(el => el.dataset.name);
  const novices = Array.from(document.querySelectorAll('#novicesChips .skill-chip.active')).map(el => el.dataset.name);
  const prizes  = Array.from(document.querySelectorAll('input[data-prize]')).map(el => el.value.trim() || `${tc - parseInt(el.dataset.prize)}0만원`);

  // perTeam은 최대 팀 기준으로 저장 (레인 배정 계산용)
  CFG = { teamCount: tc, laneCount: lc, perTeam: pt, names, pros, novices, prizes };
  bonusGameDoll  = true;  // 보너스 게임 기본: 둘 다 선택
  bonusGameTimer = true;

  // 런타임 팀 정보 초기화
  TEAM_COLORS = ALL_TEAM_COLORS.slice(0, tc);
  TEAM_NAMES  = ALL_TEAM_NAMES.slice(0, tc);
  TEAM_EMOJIS = ALL_TEAM_EMOJIS.slice(0, tc);
  teams       = Array.from({length: tc}, () => []);
  rawTeams    = Array.from({length: tc}, () => []);
  clawRepByTeam = [];
  timerRecords = {};

  // 오프닝 시상 미리보기 렌더
  document.getElementById('prizePreview').innerHTML = prizes.map((p, i) => {
    const cls  = ['gold','silver','bronze','fourth','fourth','fourth'][i];
    const med  = ['🥇','🥈','🥉','🎖','🎖','🎖'][i];
    const rank = ['1등','2등','3등','4등','5등','6등'][i];
    return `<div class="prize-item ${cls}">${med} ${rank} <span>${p}</span> 외식 상품권</div>`;
  }).join('');

  showSlide('slide-opening');
  startStars('starCanvas2');
  // BGM 시작 (사용자 인터랙션 후이므로 AudioContext 허용됨)
  setTimeout(() => {
    startBowlingBGM();
    updateBGMBtn();
  }, 200);
}

// ══════════════════════════════════════════════════════
// ── 슬라이드 전환 ─────────────────────────────────────
// ══════════════════════════════════════════════════════
function showSlide(id) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  el.classList.add('slide-in');
  setTimeout(() => el.classList.remove('slide-in'), 600);
}

function nextSlide() {
  const slides = document.querySelectorAll('.slide');
  let curIdx = -1;
  slides.forEach((s, i) => { if (s.classList.contains('active')) curIdx = i; });
  const curId = slides[curIdx]?.id;

  if (curId === 'slide-scores') return;
  if (curId === 'slide-opening')   { showSlide('slide-countdown'); runCountdown(); return; }
  if (curId === 'slide-countdown') { showSlide('slide-roulette');  startRoulette(); return; }
  if (curId === 'slide-teams-raw') { showSlide('slide-balance');   runBalance(); return; }
  if (curId === 'slide-teams')     { showSlide('slide-lanes');     buildLanesGrid(); return; }
  if (curId === 'slide-lanes')     { showSlide('slide-matchups');  buildMatchupsGrid(); return; }
  if (curId === 'slide-matchups')  { showSlide('slide-rules');     buildRulesSlide(); return; }
  if (curId === 'slide-rules')     { showSlide('slide-scores');    buildScoreTables(); return; }
  if (curId === 'slide-rematch')   {
    if (window._ranked) buildResultGrid(window._ranked);
    showSlide('slide-result'); startFireworks(); return;
  }
  if (curIdx < slides.length - 1) showSlide(slides[curIdx + 1].id);
}

// ── 유틸 ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 카운트다운 ────────────────────────────────────────
function runCountdown() {
  let count = 3;
  const numEl = document.getElementById('countdownNum');
  const ring  = document.querySelector('.countdown-ring');
  function tick() {
    if (count > 0) {
      numEl.textContent = count;
      numEl.classList.remove('pop'); void numEl.offsetWidth; numEl.classList.add('pop');
      ring.classList.remove('ring-expand'); void ring.offsetWidth; ring.classList.add('ring-expand');
      count--;
      setTimeout(tick, 900);
    } else {
      numEl.textContent = 'START!';
      numEl.classList.remove('pop'); void numEl.offsetWidth; numEl.classList.add('pop');
      numEl.style.fontSize = '5rem'; numEl.style.color = '#FFE66D';
      setTimeout(() => {
        numEl.style.fontSize = ''; numEl.style.color = '';
        showSlide('slide-roulette'); startRoulette();
      }, 900);
    }
  }
  tick();
}

// ── 룰렛 추첨 ─────────────────────────────────────────
function startRoulette() {
  shuffledNames = shuffle(CFG.names);
  pickIndex = 0; isAutoMode = false; isPicking = false;
  rawTeams = Array.from({length: CFG.teamCount}, () => []);
  updateTeamsForming(); updateTeamProgress(); updatePickButtons();
  prepareDrum();
}

function updatePickButtons() {
  const done = pickIndex >= CFG.names.length;
  const btnN = document.getElementById('btnPickNext');
  const btnA = document.getElementById('btnPickAuto');
  if (!btnN || !btnA) return;
  btnN.disabled = done || isPicking;
  btnA.disabled = done || isAutoMode;
  btnN.textContent = done ? '✅ 배정 완료' : `🎰 다음 추첨 (${pickIndex+1}/${CFG.names.length})`;
  btnA.textContent = isAutoMode ? '⚡ 자동 진행 중...' : '⚡ 자동 배정';
}

function prepareDrum() {
  if (pickIndex >= CFG.names.length) return;
  const targetName = shuffledNames[pickIndex];
  const drum = document.getElementById('drumItems');
  drum.innerHTML = ''; drum.style.transform = 'translateY(0)';
  shuffle(CFG.names.filter(n => n !== targetName)).slice(0, 10).forEach(n => {
    const d = document.createElement('div');
    d.className = 'drum-item'; d.textContent = n; drum.appendChild(d);
  });
  const hi = document.createElement('div');
  hi.className = 'drum-item target-item'; hi.textContent = targetName; drum.appendChild(hi);
}

function pickOnce() {
  if (isPicking || pickIndex >= CFG.names.length) return;
  isPicking = true; updatePickButtons();
  runDrumSpin(() => {
    isPicking = false;
    if (pickIndex < CFG.names.length) prepareDrum();
    updatePickButtons();
    if (isAutoMode && pickIndex < CFG.names.length) setTimeout(pickOnce, 600);
  });
}

function startAutoAssign() {
  if (pickIndex >= CFG.names.length) return;
  isAutoMode = true; updatePickButtons();
  if (!isPicking) pickOnce();
}

// pickIndex → 팀 인덱스 균등 배분 함수
// 예) 18명 3팀 → [0,0,0,0,0,0, 1,1,1,1,1,1, 2,2,2,2,2,2]
// 예) 7명 3팀  → [0,0,0, 1,1, 2,2]  (3,2,2)
function getTeamIdxForPick(pickIdx, totalNames, teamCount) {
  const base = Math.floor(totalNames / teamCount);
  const rem  = totalNames % teamCount;  // 앞 rem개 팀이 base+1명
  // 팀별 누적 시작 인덱스 계산
  let cumulative = 0;
  for (let t = 0; t < teamCount; t++) {
    const size = base + (t < rem ? 1 : 0);
    if (pickIdx < cumulative + size) return t;
    cumulative += size;
  }
  return teamCount - 1; // 안전장치
}

function runDrumSpin(onDone) {
  const targetName = shuffledNames[pickIndex];
  const teamIdx    = getTeamIdxForPick(pickIndex, CFG.names.length, CFG.teamCount);
  const drum  = document.getElementById('drumItems');
  const items = drum.querySelectorAll('.drum-item');
  const ITEM_H = 60;
  let targetOffsetTop = 0;
  items.forEach((el, i) => { if (el.classList.contains('target-item')) targetOffsetTop = i * ITEM_H; });
  const finalPos = -targetOffsetTop;
  drum.style.transition = 'none'; drum.style.transform = 'translateY(0)'; void drum.offsetWidth;

  let pos = 0, speed = 4, phase = 'accel', ticks = 0;
  const cruiseTicks = 25 + Math.floor(Math.random() * 15);
  function spin() {
    ticks++;
    if (phase === 'accel') { speed = Math.min(speed + 2.5, 40); if (speed >= 40) phase = 'cruise'; }
    else if (phase === 'cruise') { if (ticks > cruiseTicks) phase = 'decel'; }
    else { speed = Math.max(Math.abs(finalPos - pos) * 0.12, 1.5); }
    pos -= speed;
    if (phase === 'decel' && pos <= finalPos + speed) {
      drum.style.transform = `translateY(${finalPos}px)`;
      items.forEach(el => el.classList.remove('drum-landing'));
      drum.querySelector('.target-item')?.classList.add('drum-landing');
      setTimeout(() => { commitPick(targetName, teamIdx); onDone(); }, 350);
      return;
    }
    drum.style.transform = `translateY(${pos}px)`;
    requestAnimationFrame(spin);
  }
  requestAnimationFrame(spin);
}

function commitPick(name, teamIdx) {
  const pick = document.getElementById('currentPick');
  pick.innerHTML = `
    <span class="pick-name" style="color:${TEAM_COLORS[teamIdx]}">${name}</span>
    <span class="pick-team">${TEAM_EMOJIS[teamIdx]} ${TEAM_NAMES[teamIdx]}</span>`;
  pick.classList.remove('pick-pop'); void pick.offsetWidth; pick.classList.add('pick-pop');
  rawTeams[teamIdx].push(name);
  pickIndex++;
  updateTeamsForming(); updateTeamProgress();
  if (pickIndex >= CFG.names.length) {
    teams = rawTeams.map(t => [...t]);
    updatePickButtons();
    const doneBtn = document.getElementById('btnPickDone');
    if (doneBtn) { doneBtn.style.display = 'block'; doneBtn.classList.add('btn-pulse'); }
  }
}

function updateTeamsForming() {
  document.getElementById('teamsForming').innerHTML = rawTeams.map((t, i) =>
    `<div class="forming-team" style="border-color:${TEAM_COLORS[i]}">
       <span class="forming-name" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</span>
       <span class="forming-members">${t.map(n => {
         if (CFG.pros.includes(n))    return `<em class="fp">${n}</em>`;
         if (CFG.novices.includes(n)) return `<em class="fn">${n}</em>`;
         return n;
       }).join(' · ') || '–'}</span>
     </div>`).join('');
}
function updateTeamProgress() {
  document.getElementById('teamProgress').textContent = `${pickIndex} / ${CFG.names.length}명 배정 완료`;
}

// ── 1차 랜덤 팀 표시 ──────────────────────────────────
function buildRawTeamsGrid() {
  document.getElementById('teamsGridRaw').innerHTML = rawTeams.map((team, i) =>
    `<div class="team-card" style="--delay:${i*0.2}s; border-color:${TEAM_COLORS[i]}">
       <div class="team-card-header" style="background:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>
       <div class="team-members">
         ${team.map(n => `<div class="member-chip ${CFG.pros.includes(n)?'pro':CFG.novices.includes(n)?'novice':''}">
           ${CFG.pros.includes(n)?'🏆 ':CFG.novices.includes(n)?'🌱 ':''}${n}</div>`).join('')}
       </div>
     </div>`).join('');
}

// ── 밸런싱 ────────────────────────────────────────────
function buildBalancedTeams() {
  let t = rawTeams.map(arr => [...arr]);
  balanceSwapLog = [];

  // Step 1: 고수 균등 분산
  for (let attempt = 0; attempt < 12; attempt++) {
    const pd = t.map(arr => arr.filter(n => CFG.pros.includes(n)));
    const overIdx  = pd.reduce((mi, a, i, arr) => a.length > arr[mi].length ? i : mi, 0);
    const emptyIdx = pd.reduce((mi, a, i, arr) => a.length < arr[mi].length ? i : mi, 0);
    if (pd[overIdx].length - pd[emptyIdx].length <= 1) break;
    const movePro  = pd[overIdx][pd[overIdx].length - 1];
    const swapWith = t[emptyIdx].find(n => !CFG.pros.includes(n) && !CFG.novices.includes(n))
                  || t[emptyIdx].find(n => !CFG.pros.includes(n));
    if (!movePro || !swapWith) break;
    t[overIdx]  = t[overIdx].filter(n => n !== movePro);  t[overIdx].push(swapWith);
    t[emptyIdx] = t[emptyIdx].filter(n => n !== swapWith); t[emptyIdx].push(movePro);
    balanceSwapLog.push({ type:'pro', msg:`💪 <span class="swap-hl-gold">${movePro}</span> (고수) → ${TEAM_EMOJIS[emptyIdx]} ${TEAM_NAMES[emptyIdx]}으로 이동` });
  }

  // Step 2: 초보 균등 배분
  for (let pass = 0; pass < 10; pass++) {
    const nc   = t.map(arr => arr.filter(n => CFG.novices.includes(n)).length);
    const maxT = nc.indexOf(Math.max(...nc));
    const minT = nc.indexOf(Math.min(...nc));
    if (nc[maxT] - nc[minT] <= 1) break;
    const mv = t[maxT].find(n => CFG.novices.includes(n));
    const sw = t[minT].find(n => !CFG.novices.includes(n) && !CFG.pros.includes(n));
    if (!mv || !sw) break;
    t[maxT] = t[maxT].filter(n => n !== mv); t[maxT].push(sw);
    t[minT] = t[minT].filter(n => n !== sw); t[minT].push(mv);
    balanceSwapLog.push({ type:'novice', msg:`🌱 <span class="swap-hl-green">${mv}</span> (초보) → ${TEAM_EMOJIS[minT]} ${TEAM_NAMES[minT]}으로 이동` });
  }
  return t;
}

function runBalance() {
  const balanced = buildBalancedTeams();
  const title = document.getElementById('balanceTitle');
  const warning = document.getElementById('balanceWarning');
  const swapsEl = document.getElementById('balanceSwaps');
  const status  = document.getElementById('balanceStatus');
  title.innerHTML = ''; warning.innerHTML = ''; swapsEl.innerHTML = ''; status.innerHTML = '';

  const proNames = CFG.pros.join(' · ') || '없음';
  setTimeout(() => { title.innerHTML = `<span class="blink-red">⚠️ 실력 불균형 감지!</span>`; title.classList.add('shake'); }, 300);
  setTimeout(() => {
    warning.innerHTML = `<div class="warning-box">
      <div class="warning-item pro-warn">🏆 <strong>고수 집중 경보</strong><br/><span>${proNames}이(가) 너무 강합니다!</span></div>
      <div class="warning-item novice-warn">🌱 <strong>초보 쏠림 경보</strong><br/><span>초보/경험 부족 멤버 배분을 조정합니다!</span></div>
    </div>`;
  }, 1200);
  setTimeout(() => { title.innerHTML = `🔄 팀 멤버 재배치 중...`; title.classList.remove('shake'); }, 2500);

  let swapDelay = 3200;
  if (balanceSwapLog.length === 0) {
    setTimeout(() => { swapsEl.innerHTML = `<div class="swap-item">✅ 이미 균형이 잡혀 있습니다!</div>`; }, swapDelay);
    swapDelay += 600;
  } else {
    balanceSwapLog.forEach((log, idx) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = `swap-item swap-${log.type}`; el.innerHTML = log.msg; swapsEl.appendChild(el);
      }, swapDelay + idx * 700);
    });
    swapDelay += balanceSwapLog.length * 700;
  }
  const fin = swapDelay + 800;
  setTimeout(() => { title.innerHTML = `✅ 균형 조정 완료!`; status.innerHTML = `<span class="balance-ok">⚖️ 공정한 팀 구성이 완성되었습니다!</span>`; startConfetti('balanceCanvas'); }, fin);
  setTimeout(() => { teams = balanced; showSlide('slide-teams'); buildTeamsGrid(); startConfetti('confettiCanvas2'); }, fin + 1800);
}

function buildTeamsGrid() {
  document.getElementById('teamsGrid').innerHTML = teams.map((team, i) =>
    `<div class="team-card" style="--delay:${i*0.25}s; border-color:${TEAM_COLORS[i]}">
       <div class="team-card-header" style="background:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>
       <div class="team-members">
         ${team.map(n => `<div class="member-chip ${CFG.pros.includes(n)?'pro':CFG.novices.includes(n)?'novice':''}">
           ${CFG.pros.includes(n)?'🏆 ':CFG.novices.includes(n)?'🌱 ':''}${n}</div>`).join('')}
       </div>
     </div>`).join('');
}

// ── 레인 배치표 ───────────────────────────────────────
/*
 * ══════════════════════════════════════════════════════
 * 새 레인 배정 규칙 (v3)
 * ══════════════════════════════════════════════════════
 * ① 팀은 3개 또는 4개만 허용
 * ② 레인은 최소 4개 (최대 8개)
 * ③ 노는 레인 없음 — 모든 레인에 인원 배정
 * ④ 한 레인에는 같은 팀 인원만 배정
 * ⑤ 짝수(인접) 레인 쌍끼리 동일 인원수로 대결
 *    예) LANE1↔LANE2, LANE3↔LANE4
 * ⑥ 전체 인원을 레인 수로 나눌 때 "큰 쪽 먼저"
 *    예) 18명 ÷ 4레인 → 5,5,4,4
 *        18명 ÷ 5레인 → 4,4,4,3,3 (≥3명 보장)
 *        18명 ÷ 6레인 → 3,3,3,3,3,3
 *
 * 알고리즘
 * ────────────────────────────────────────────────────
 * 1. 전체 참가자를 레인 수로 분할하여 각 레인 인원수 결정
 *    (큰 값 먼저: base+1이 앞 레인, base가 뒤 레인)
 * 2. 짝 레인 쌍(0·1, 2·3, …)별로 인원수 합산(pairTotal)
 * 3. 각 팀 인원을 순서대로 레인에 채움 (라운드로빈)
 *    팀이 3개면: A→B→C→A→B→C…
 *    팀이 4개면: A→B→C→D→A→B…
 * 4. 짝 레인 쌍에서 두 팀의 인원수가 동일하도록 조정
 * ══════════════════════════════════════════════════════
 */
function getLaneData() {
  /*
   * ══════════════════════════════════════════════════════
   * 레인 배정 알고리즘 (v6 - 최종)
   * ══════════════════════════════════════════════════════
   *
   * 규칙:
   *  ① 레인 1개 = 1팀 인원만 (같은 팀끼리)
   *  ② 단독 레인 없음 — 모든 레인은 반드시 짝이 있어야 함
   *  ③ 인접 레인 쌍(1·2, 3·4, …)끼리 대결
   *  ④ 짝 레인 양쪽 인원 수 동일 (±1 허용)
   *
   * 핵심 아이디어:
   *  • 레인 수(lc)가 팀 수(tc)보다 작으면 → 일부 팀이 같은 레인에 합류 불가
   *    → lc는 항상 tc의 배수여야 이상적 (tc≤lc 이고 lc%2==0)
   *  • 레인을 팀에 1:1 순환 배정 (라운드로빈):
   *      lc=4, tc=4 → 레인1=A, 레인2=B, 레인3=C, 레인4=D
   *      lc=4, tc=3 → 레인1=A, 레인2=B, 레인3=C, 레인4=A (A가 2레인)
   *      lc=6, tc=3 → 레인1=A, 레인2=B, 레인3=C, 레인4=A, 레인5=B, 레인6=C
   *  • 각 팀 인원을 해당 팀이 쓰는 레인 수로 균등 분할
   *  • 짝 레인(1·2, 3·4, …) 내 두 팀 인원 수가 다르면 ±1 보정
   *
   * 인원 배분 예시:
   *  18명 4팀 4레인 → 팀당 ~4.5명 → 5,4,5,4 또는 5,5,4,4
   *  19명 4팀 4레인 → 팀별 5,5,5,4 → 레인 5,5,5,4
   *  18명 3팀 4레인 → A(2레인), B(1레인), C(1레인)
   *                   → A→[레인1·4], B→[레인2], C→[레인3]
   *                   → 쌍(1·2): A(4~5)vs B(6), 쌍(3·4): C(6)vs A(4~5)
   * ══════════════════════════════════════════════════════
   */
  const { teamCount: tc, laneCount: lc } = CFG;

  // ── ① 레인 → 팀 순환 배정 (라운드로빈, 단독 없이 짝 보장) ─
  // lc가 홀수이면 마지막 레인이 단독이 될 수 있으므로
  // 실제 사용 레인 수를 짝수로 맞춤 (lc가 홀수면 lc-1 사용)
  const usedLc    = lc % 2 === 0 ? lc : lc - 1;   // 실제 사용 레인 수 (짝수)
  const pairCount = usedLc / 2;

  // 레인별 팀 인덱스 (0-based 라운드로빈)
  const laneTeam = Array.from({ length: usedLc }, (_, i) => i % tc);

  // ── ② 팀별 출전 레인 인덱스 목록 수집 ─────────────────
  const teamLanes = Array.from({ length: tc }, () => []); // teamLanes[t] = [laneIdx, ...]
  laneTeam.forEach((t, laneIdx) => teamLanes[t].push(laneIdx));

  // ── ③ 팀 인원을 출전 레인 수에 따라 균등 분할 ──────────
  // splitEvenly(members, k): k개 슬롯에 균등하게 나눔 (큰 쪽 먼저)
  function splitEvenly(members, k) {
    if (k <= 0) return [];
    const n = members.length, base = Math.floor(n / k), rem = n % k;
    const slices = []; let cur = 0;
    for (let s = 0; s < k; s++) {
      const sz = base + (s < rem ? 1 : 0);
      slices.push(members.slice(cur, cur + sz));
      cur += sz;
    }
    return slices;
  }

  // teamSliceMap[t][laneIdx] = 해당 레인에서 이 팀이 내보낼 멤버 배열
  const teamSliceMap = teams.map((members, t) => {
    const myLanes  = teamLanes[t];                     // 이 팀이 배정된 레인들
    const slices   = splitEvenly(members, myLanes.length);
    const map = {};
    myLanes.forEach((laneIdx, k) => { map[laneIdx] = slices[k] || []; });
    return map;
  });

  // ── ④ 쌍별 레인 엔트리 구성 ───────────────────────────
  const pairs = [];
  for (let p = 0; p < pairCount; p++) {
    const laneIdxA = p * 2;         // 0-based
    const laneIdxB = p * 2 + 1;
    const laneNoA  = laneIdxA + 1;  // 1-based
    const laneNoB  = laneIdxB + 1;
    const tA = laneTeam[laneIdxA];
    const tB = laneTeam[laneIdxB];

    let membersA = [...(teamSliceMap[tA][laneIdxA] || [])];
    let membersB = [...(teamSliceMap[tB][laneIdxB] || [])];

    // ── ⑤ 짝 레인 인원 균등화 (±1 이내로 보정) ───────────
    // 차이가 2 이상이면 많은 쪽에서 적은 쪽으로 이동
    const diff = membersA.length - membersB.length;
    if (Math.abs(diff) >= 2) {
      const [big, small] = diff > 0 ? [membersA, membersB] : [membersB, membersA];
      const move = Math.floor(Math.abs(diff) / 2);
      small.push(...big.splice(big.length - move, move));
    }

    pairs.push({
      isPair : true,        // 단독 레인 없음 — 항상 쌍
      laneA  : laneNoA, laneB: laneNoB,
      teamA  : { idx: tA, members: membersA },
      teamB  : { idx: tB, members: membersB },
    });
  }

  // ── ⑥ 사용되지 않은 레인이 있으면 안내 (홀수 레인 설정 시) ─
  if (lc !== usedLc) {
    console.warn(`레인 수 ${lc}가 홀수입니다. 마지막 레인(${lc}번)은 사용하지 않습니다.`);
  }

  return pairs;
}

// ── 레인 배치 렌더 ────────────────────────────────────
function buildLanesGrid() {
  const pairs = getLaneData();
  const { laneCount: lc } = CFG;
  const usedLc = lc % 2 === 0 ? lc : lc - 1;

  // 실제 사용 레인의 총 인원 합산
  const totalMembers = teams.reduce((s, t) => s + t.length, 0);
  const basePerLane  = Math.floor(totalMembers / usedLc);
  const remLane      = totalMembers % usedLc;

  // 레인 인원 패턴 요약
  let pattern = '';
  if (remLane > 0) {
    pattern = `${basePerLane+1}명 × ${remLane}레인 + ${basePerLane}명 × ${usedLc - remLane}레인`;
  } else {
    pattern = `${basePerLane}명 × ${usedLc}레인`;
  }

  const pairCount = usedLc / 2;
  const unusedNote = lc !== usedLc ? ` (${lc}번 레인 미사용)` : '';
  document.getElementById('laneDesc').textContent =
    `🎳 ${usedLc}개 레인${unusedNote} · 인원 배분: ${pattern} · ${pairCount}쌍 대결`;

  document.getElementById('lanesGrid').innerHTML = pairs.map((pair, pi) => {
    // 단독 레인은 더 이상 없음 — 항상 isPair === true
    const cA = TEAM_COLORS[pair.teamA.idx];
    const cB = TEAM_COLORS[pair.teamB.idx];
    const eq = pair.teamA.members.length === pair.teamB.members.length;

    return `
      <div class="lane-pair-card fade-in" style="--delay:${pi * 0.12}s">
        <div class="lane-pair-badge">
          LANE ${pair.laneA} · LANE ${pair.laneB}
          <span class="lane-pair-vs">⚔️ 대결</span>
        </div>
        <div class="lane-pair-body">
          <div class="lane-team-block" style="border-color:${cA}">
            <div class="lane-block-no" style="background:${cA}">LANE ${pair.laneA}</div>
            <div class="lane-block-name" style="color:${cA}">${TEAM_EMOJIS[pair.teamA.idx]} ${TEAM_NAMES[pair.teamA.idx]}</div>
            <div class="lane-block-members">${pair.teamA.members.join(' · ')}</div>
            <div class="lane-block-count">${pair.teamA.members.length}명</div>
          </div>
          <div class="lane-pair-vs-badge">VS</div>
          <div class="lane-team-block" style="border-color:${cB}">
            <div class="lane-block-no" style="background:${cB}">LANE ${pair.laneB}</div>
            <div class="lane-block-name" style="color:${cB}">${TEAM_EMOJIS[pair.teamB.idx]} ${TEAM_NAMES[pair.teamB.idx]}</div>
            <div class="lane-block-members">${pair.teamB.members.join(' · ')}</div>
            <div class="lane-block-count">${pair.teamB.members.length}명</div>
          </div>
        </div>
        <div class="lane-pair-eq">
          ${eq
            ? `<span class="eq-badge">✅ ${pair.teamA.members.length}명 vs ${pair.teamB.members.length}명 균등</span>`
            : `<span class="eq-badge neq">⚡ ${pair.teamA.members.length}명 vs ${pair.teamB.members.length}명</span>`}
        </div>
      </div>`;
  }).join('');
}

// ── 대진표 (동적) ─────────────────────────────────────
function buildMatchupsGrid() {
  const pairs = getLaneData();
  const matchups = [];

  pairs.forEach(pair => {
    if (!pair.isPair || !pair.teamB) return;
    const aLen = pair.teamA.members.length;
    const bLen = pair.teamB.members.length;
    const maxLen = Math.max(aLen, bLen);
    for (let i = 0; i < maxLen; i++) {
      const p1 = pair.teamA.members[i];
      const p2 = pair.teamB.members[i];
      if (p1 && p2) {
        matchups.push({ laneA: pair.laneA, laneB: pair.laneB, p1, t1: pair.teamA.idx, p2, t2: pair.teamB.idx });
      }
    }
  });

  document.getElementById('matchupDesc').textContent = `총 ${matchups.length}개 1:1 개인 대진`;
  document.getElementById('matchupsGrid').innerHTML = matchups.map((m, idx) =>
    `<div class="matchup-card fade-in" style="--delay:${idx*0.06}s">
       <div class="matchup-lane">LANE ${m.laneA} · ${m.laneB}</div>
       <div class="matchup-inner">
         <div class="matchup-player" style="color:${TEAM_COLORS[m.t1]}">${TEAM_EMOJIS[m.t1]} ${m.p1}</div>
         <div class="matchup-vs">⚔️</div>
         <div class="matchup-player" style="color:${TEAM_COLORS[m.t2]}">${TEAM_EMOJIS[m.t2]} ${m.p2}</div>
       </div>
     </div>`).join('');
}

// ── 경기 규칙 슬라이드 (동적) ─────────────────────────
function buildRulesSlide() {
  const tc = CFG.teamCount;
  const lc = CFG.laneCount;
  // 실제 배정된 멤버 수 합산
  const total = teams.reduce((s, t) => s + t.length, 0);
  const base  = Math.floor(total / lc);
  const rem   = total % lc;
  // 레인 인원 패턴 문자열
  const sizeArr = Array.from({length: lc}, (_, i) => base + (i < rem ? 1 : 0));
  const lanePattern = [...new Set(sizeArr)].length > 1
    ? `${base+1}명 × ${rem}레인 + ${base}명 × ${lc-rem}레인`
    : `${base}명 × ${lc}레인`;

  document.getElementById('rulesContainer').innerHTML = `
    <div class="rule-card">
      <div class="rule-num">1</div>
      <div class="rule-content">
        <h3>🎳 레인 배정 방식</h3>
        <p>전체 <strong>${total}명</strong>을 <strong>${lc}개 레인</strong>에 균등 배정합니다.</p>
        <p>📐 레인 인원 패턴: <strong>${lanePattern}</strong></p>
        <p>인접한 두 레인(예: 1·2, 3·4)이 짝을 이루어 <strong>같은 인원수로 대결</strong>합니다.</p>
      </div>
    </div>
    <div class="rule-card">
      <div class="rule-num">2</div>
      <div class="rule-content">
        <h3>🏆 점수 산정</h3>
        <p>각 레인에서 팀원 점수를 합산하여 <strong>팀 총점</strong>으로 순위를 결정합니다.</p>
        <p>${lc}개 레인의 결과를 모두 취합 → <strong>최종 팀 합산 점수</strong></p>
        <p class="rule-note">※ 팀 인원이 <strong>5명이거나 홀수</strong>인 경우: 팀 합산 점수 ÷ 팀원 수(평균)를 구한 뒤, 상대 팀 인원 수를 곱하여 점수를 산출합니다.</p>
      </div>
    </div>
    <div class="rule-card">
      <div class="rule-num">3</div>
      <div class="rule-content">
        <h3>🔄 2게임 방식 (선택)</h3>
        <p>1게임 결과 기준으로 <strong>재대진</strong>을 구성합니다.</p>
        <div class="bracket">
          <div class="bracket-row top">🏆 결승: <span>1위 팀 VS 2위 팀</span></div>
          ${tc > 2 ? `<div class="bracket-row bottom">🎯 나머지 팀: 추가 게임 진행</div>` : ''}
        </div>
        <p>2게임 점수도 <strong>합산</strong>하여 최종 순위 결정</p>
      </div>
    </div>
    <div class="rule-card bonus">
      <div class="rule-num">⏱️</div>
      <div class="rule-content">
        <h3>10초 맞추기 게임 <span class="rule-badge" style="background:rgba(34,197,94,0.25);color:#22c55e;border-color:rgba(34,197,94,0.5)">중복선택 가능</span></h3>
        <p><strong>10초라고 생각될 때 STOP!</strong> 10초에 가장 가까운 팀 승리</p>
        <div class="bonus-rank-table">
          <div class="brt-row gold">🥇 1위(10초 최근접) <strong>+30점</strong></div>
          <div class="brt-row silver">🥈 2위 <strong>+21점</strong></div>
          <div class="brt-row bronze">🥉 3위 <strong>+15점</strong></div>
          <div class="brt-row">4위 <strong>+15점</strong></div>
        </div>
        <p class="rule-note">※ 동점이면 같은 순위로 처리 · 점수 입력 화면에서 안내 순서대로 먼저 진행합니다</p>
      </div>
    </div>
    <div class="rule-card bonus">
      <div class="rule-num">🧸</div>
      <div class="rule-content">
        <h3>인형뽑기 보너스 <span class="rule-badge" style="background:rgba(34,197,94,0.25);color:#22c55e;border-color:rgba(34,197,94,0.5)">중복선택 가능</span></h3>
        <p>팀별 <strong>1만원</strong>씩 인형뽑기 진행 · 시뮬레이션은 <strong>팀당 지정 대표 1명</strong>만 플레이</p>
        <div class="bonus-rank-table">
          <div class="brt-row gold">🥇 1위(최다) <strong>+40점</strong></div>
          <div class="brt-row silver">🥈 2위 <strong>+26점</strong></div>
          <div class="brt-row bronze">🥉 3위 <strong>+16점</strong></div>
          <div class="brt-row">4위 <strong>+10점</strong></div>
        </div>
      </div>
    </div>
    <div class="pickme-section">
      <div class="pickme-section-title">📍 픽미픽미 (PICKME PICKME)</div>
      <div class="pickme-section-sub">인형뽑기 & 10초 맞추기 게임 장소</div>
      <div class="pickme-photos">
        <div class="pickme-photo">
          <img src="images/pickme1.jpg" alt="픽미픽미 - 10초 맞추기 기계 (먼저 안내)" loading="lazy"/>
        </div>
        <div class="pickme-photo">
          <img src="images/pickme2.jpg" alt="픽미픽미 - 인형뽑기 기계" loading="lazy"/>
        </div>
      </div>
    </div>
    <div class="claw-game-launch">
      <div class="claw-launch-title">🎮 인형뽑기 시뮬레이션</div>
      <div class="claw-launch-desc">점수 입력 화면에서 <strong>팀당 대표 1명</strong>을 지정하면, 시뮬레이션은 그 대표만 플레이합니다.<br>팀 편성은 추첨 결과와 동일하게 유지됩니다.</div>
      <button class="claw-launch-btn" onclick="launchClawGame()">
        🧸 인형뽑기 게임 시작하기
      </button>
    </div>`;
}

// ══════════════════════════════════════════════════════
// ── 인형뽑기 시뮬레이션 게임 런치 (claw.html 연동)
// ══════════════════════════════════════════════════════
function ensureClawReps() {
  if (!Array.isArray(clawRepByTeam)) clawRepByTeam = [];
  if (clawRepByTeam.length !== teams.length) {
    clawRepByTeam = teams.map(members => (members && members[0]) ? members[0] : '');
  } else {
    clawRepByTeam = teams.map((members, i) => {
      const prev = clawRepByTeam[i];
      if (prev && members.includes(prev)) return prev;
      return (members && members[0]) ? members[0] : '';
    });
  }
}

function readClawRepsFromUI() {
  ensureClawReps();
  const host = document.getElementById('clawRepHost');
  if (!host) return;
  teams.forEach((members, i) => {
    const sel = host.querySelector(`select[data-team-i="${i}"]`);
    if (sel && members.includes(sel.value)) clawRepByTeam[i] = sel.value;
  });
}

function buildClawRepUI() {
  const host = document.getElementById('clawRepHost');
  if (!host) return;
  if (!bonusGameDoll) {
    host.innerHTML = '';
    return;
  }
  ensureClawReps();
  host.innerHTML = `
    <div class="claw-rep-title">🧑‍🤝‍🧑 인형뽑기 참가 대표 (팀당 1명)</div>
    <div class="claw-rep-grid">
      ${teams.map((members, i) => {
        if (!members || !members.length) return '';
        const opts = members.map(m => `<option value="${String(m).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${String(m).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('');
        return `<label class="claw-rep-item" style="border-color:${TEAM_COLORS[i]}80">
          <span class="claw-rep-lbl" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</span>
          <select class="claw-rep-select" data-team-i="${i}" aria-label="${TEAM_NAMES[i]} 인형뽑기 대표">${opts}</select>
        </label>`;
      }).filter(Boolean).join('')}
    </div>
    <p class="claw-rep-hint">추첨으로 정해진 팀 구성은 그대로이며, 시뮬에는 여기서 고른 대표만 참여합니다. 선택은 저장되어 claw 복귀 후에도 유지됩니다.</p>`;
  teams.forEach((members, i) => {
    const sel = host.querySelector(`select[data-team-i="${i}"]`);
    if (!sel || !members.length) return;
    const want = clawRepByTeam[i];
    sel.value = members.includes(want) ? want : members[0];
    clawRepByTeam[i] = sel.value;
    sel.addEventListener('change', () => { clawRepByTeam[i] = sel.value; });
  });
}

function launchClawGame() {
  // 현재 팀 데이터를 localStorage에 저장하고 claw.html로 이동
  try {
    readClawRepsFromUI();
    ensureClawReps();
    const clawData = {
      teams: teams.map((members, i) => ({
        name   : TEAM_NAMES[i]  || `${i+1}조`,
        color  : TEAM_COLORS[i] || '#ffffff',
        emoji  : TEAM_EMOJIS[i] || '🔵',
        members: members,
      })),
      clawReps: [...clawRepByTeam],
      returnUrl: 'index.html#slide-scores',
    };
    localStorage.setItem('clawGameData', JSON.stringify(clawData));

    // ─── 현재 볼링 앱 상태 전체 보존 (복귀 후 복원용) ───
    const appState = {
      CFG,
      TEAM_COLORS, TEAM_NAMES, TEAM_EMOJIS,
      teams, rawTeams,
      gameMode,
      bonusGameDoll, bonusGameTimer,
      clawRepByTeam: [...clawRepByTeam],
      timerRecords: { ...timerRecords },
    };
    localStorage.setItem('bowlingAppState', JSON.stringify(appState));

    window.location.href = 'claw.html';
  } catch(e) {
    alert('팀 데이터 저장 실패: ' + e.message);
  }
}

// ══════════════════════════════════════════════════════
// ── 보너스 점수 테이블
// ── 인형뽑기: 1위=20점, 2위=13점, 3위=8점, 4위=5점
// ── 10초게임: 1위=10점, 2위=7점, 3위=5점, 4위=5점
//    → 볼링 1게임 점수 차이(~50~100점)와 균형
// ══════════════════════════════════════════════════════
const DOLL_BONUS_POINTS  = [40, 26, 16, 10];  // 인형뽑기 순위별 점수 (×2)
const TIMER_BONUS_POINTS = [30, 21, 15, 15];  // 10초게임 순위별 점수 (×3)

// 보너스 게임 토글 (택1 또는 택2)
function toggleBonusGame() {
  const chkDoll  = document.getElementById('chkDoll');
  const chkTimer = document.getElementById('chkTimer');

  // 최소 1개는 반드시 선택
  if (!chkDoll.checked && !chkTimer.checked) {
    // 방금 해제한 쪽을 다시 체크 (적어도 1개 유지)
    // 이전 상태 복원: bonusGameDoll, bonusGameTimer 참조
    if (!bonusGameDoll && !bonusGameTimer) { chkDoll.checked = true; }
    else if (!bonusGameDoll) { chkDoll.checked = true; }
    else { chkTimer.checked = true; }
  }

  bonusGameDoll  = chkDoll  ? chkDoll.checked  : bonusGameDoll;
  bonusGameTimer = chkTimer ? chkTimer.checked : bonusGameTimer;

  document.getElementById('panelDoll').style.display  = bonusGameDoll  ? '' : 'none';
  document.getElementById('panelTimer').style.display = bonusGameTimer ? '' : 'none';
  document.getElementById('tabDoll').classList.toggle('active',  bonusGameDoll);
  document.getElementById('tabTimer').classList.toggle('active', bonusGameTimer);
  if (bonusGameDoll) buildClawRepUI();
}

// ── 점수 입력 + 보너스 게임 ───────────────────────────
function updateGameMode() {
  gameMode = parseInt(document.querySelector('input[name="gameMode"]:checked').value);
}

function buildScoreTables() {
  // 볼링 점수 입력
  document.getElementById('scoreTables').innerHTML = `
    <h3>🎳 1게임 팀 합산 점수 입력</h3>
    <div class="score-row">
      ${teams.map((_, i) => `<div class="score-input-card" style="border-color:${TEAM_COLORS[i]}">
        <div class="score-team-label" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>
        <input type="number" class="score-input" id="score1-${i}" placeholder="합산 점수" min="0" max="9999"/>
      </div>`).join('')}
    </div>
    <div id="game2Section" style="display:none">
      <h3>🔄 2게임 팀 합산 점수 입력</h3>
      <div class="score-row">
        ${teams.map((_, i) => `<div class="score-input-card" style="border-color:${TEAM_COLORS[i]}">
          <div class="score-team-label" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>
          <input type="number" class="score-input" id="score2-${i}" placeholder="합산 점수" min="0" max="9999"/>
        </div>`).join('')}
      </div>
    </div>`;

  document.querySelectorAll('input[name="gameMode"]').forEach(r => {
    r.addEventListener('change', () => {
      gameMode = parseInt(r.value);
      document.getElementById('game2Section').style.display = gameMode === 2 ? 'block' : 'none';
    });
  });

  // 인형뽑기 입력 UI
  document.getElementById('dollInputs').innerHTML = teams.map((_, i) =>
    `<div class="doll-input-card" style="border-color:${TEAM_COLORS[i]}">
       <div class="doll-team-label" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>
       <input type="number" class="doll-input" id="doll-${i}" placeholder="인형 수" min="0" max="99"/>
     </div>`).join('');

  buildClawRepUI();

  // clawResult가 있으면 자동으로 인형 수 입력
  autoFillClawResult();

  // 10초 게임 UI
  buildTimerGame();

  // 현재 선택된 보너스 게임 패널 동기화
  document.getElementById('panelDoll').style.display  = bonusGameDoll  ? '' : 'none';
  document.getElementById('panelTimer').style.display = bonusGameTimer ? '' : 'none';
  document.getElementById('tabDoll').classList.toggle('active',  bonusGameDoll);
  document.getElementById('tabTimer').classList.toggle('active', bonusGameTimer);
  const chkDoll  = document.getElementById('chkDoll');
  const chkTimer = document.getElementById('chkTimer');
  if (chkDoll)  chkDoll.checked  = bonusGameDoll;
  if (chkTimer) chkTimer.checked = bonusGameTimer;
}

// ── 인형뽑기 시뮬레이션 결과 자동 입력 ─────────────────
function autoFillClawResult() {
  try {
    const raw = localStorage.getItem('clawResult');
    if (!raw) return;
    const result = JSON.parse(raw);
    if (!Array.isArray(result)) return;

    result.forEach(r => {
      const el = document.getElementById(`doll-${r.teamIdx}`);
      if (el && r.caught !== undefined) {
        el.value = r.caught;
        // 시각적으로 자동 입력임을 표시
        el.style.background = 'rgba(139,92,246,0.2)';
        el.style.borderColor = '#8B5CF6';
        el.title = `🎮 시뮬레이션 결과 자동 반영 (${r.caught}개)`;
      }
    });

    // 안내 메시지 표시
    const dollInputsEl = document.getElementById('dollInputs');
    if (dollInputsEl) {
      const existingNote = dollInputsEl.querySelector('.claw-auto-note');
      if (!existingNote) {
        const note = document.createElement('div');
        note.className = 'claw-auto-note';
        note.style.cssText = 'font-size:.78rem;color:#a78bfa;margin-top:.5rem;padding:.3rem .6rem;background:rgba(139,92,246,.12);border-radius:8px;border:1px solid rgba(139,92,246,.3)';
        note.innerHTML = '✅ 시뮬레이션 결과가 자동으로 반영되었습니다. 직접 수정도 가능합니다.';
        dollInputsEl.appendChild(note);
      }
    }
  } catch(e) {}
}

// ── 순위 → 보너스 점수 변환 ───────────────────────────
// bonusTable: 순위별 점수 배열 (0-based)
// higherIsBetter: true → 큰 값이 1위, false → 작은 값이 1위
// 동점자 처리: 같은 값이면 같은 순위 (dense rank)
function rankToBonus(values, higherIsBetter, bonusTable) {
  const table = bonusTable || DOLL_BONUS_POINTS;
  // unique 정렬값
  const sorted = [...new Set(values)].sort((a, b) => higherIsBetter ? b - a : a - b);
  return values.map(v => {
    const rank = sorted.indexOf(v); // 0-based dense rank
    return table[Math.min(rank, table.length - 1)];
  });
}

// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// ── 10초 맞추기 게임 (스탑워치 UI)
// ══════════════════════════════════════════════════════
/** 기록된 팀의 스탑워치 UI만 복구 (재빌드·claw 복귀 후에도 합계에 반영되도록) */
function restoreTimerTeamUI(teamIdx) {
  const elapsed = timerRecords[teamIdx];
  if (elapsed == null) return;
  const diff = Math.abs(elapsed - 10);
  updateStopwatchArc(teamIdx, elapsed);
  const timeEl = document.getElementById(`swTime-${teamIdx}`);
  if (timeEl) timeEl.style.color = '#ffd700';
  const diffEl = document.getElementById(`timerDiff-${teamIdx}`);
  if (diffEl) diffEl.textContent = `오차: ${diff.toFixed(2)}초`;
  const btn = document.getElementById(`timerBtn-${teamIdx}`);
  if (btn) {
    btn.textContent = '✅ 기록 완료';
    btn.disabled = true;
    btn.classList.remove('timer-btn-active');
    btn.classList.add('timer-btn-done');
  }
}

function buildTimerGame() {
  const prev = { ...timerRecords };
  timerRecords = {};
  for (let i = 0; i < teams.length; i++) {
    if (prev[i] != null) timerRecords[i] = prev[i];
  }
  timerRunning    = false;
  timerActiveTeam = -1;
  stopTimerVoiceControl();
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  document.getElementById('timerGameArea').innerHTML = `
    <div class="stopwatch-guide">
      🖱️ 버튼을 <strong>누르고 있다 놓으세요</strong> &nbsp;|&nbsp; ⌨️ 팀을 선택 후 <strong>스페이스바</strong>로도 가능
    </div>
    <div style="display:flex;gap:.5rem;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:.5rem;">
      <button id="btnTimerMic" onclick="void toggleTimerVoiceControl()"
        style="padding:.45rem .9rem;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fda4af;font-size:.82rem;font-weight:700;cursor:pointer;font-family:var(--font);">
        🎙️ 마이크 모드 OFF
      </button>
      <span id="timerVoiceStatus" style="font-size:.78rem;color:rgba(255,255,255,.55);">명령: "멈춰"</span>
    </div>
    <div class="timer-teams" id="timerTeams">
      ${teams.map((_, i) => `
        <div class="timer-team-card" id="timerCard-${i}" style="border-color:${TEAM_COLORS[i]}">
          <div class="timer-team-name" style="color:${TEAM_COLORS[i]}">${TEAM_EMOJIS[i]} ${TEAM_NAMES[i]}</div>

          <!-- 스탑워치 원형 진행 바 -->
          <div class="stopwatch-wrap" id="swWrap-${i}">
            <svg class="stopwatch-svg" viewBox="0 0 100 100">
              <circle class="sw-track" cx="50" cy="50" r="42"/>
              <circle class="sw-progress" id="swProg-${i}" cx="50" cy="50" r="42"
                stroke="${TEAM_COLORS[i]}"
                stroke-dasharray="263.9"
                stroke-dashoffset="263.9"/>
            </svg>
            <div class="stopwatch-inner">
              <div class="stopwatch-time" id="swTime-${i}">0.00</div>
              <div class="stopwatch-unit">초</div>
            </div>
          </div>

          <div class="timer-diff" id="timerDiff-${i}"></div>

          <button class="btn-timer-start" id="timerBtn-${i}"
                  onmousedown="timerPress(${i})" ontouchstart="event.preventDefault();timerPress(${i})"
                  onmouseup="timerRelease(${i})"   ontouchend="event.preventDefault();timerRelease(${i})"
                  onmouseleave="timerRelease(${i})">
            🖐 누르고 있다 놓기
          </button>
          <div class="sw-space-hint" id="swHint-${i}">스페이스바 사용 시 먼저 이 영역 클릭</div>
        </div>`).join('')}
    </div>
    <div class="timer-status" id="timerStatus"></div>`;

  // 카드 클릭 시 해당 팀을 스페이스바 활성 팀으로 설정
  teams.forEach((_, i) => {
    document.getElementById(`timerCard-${i}`)?.addEventListener('click', () => {
      if (timerRecords[i] != null) return; // 이미 완료
      timerActiveTeam = i;
      // 힌트 강조
      document.querySelectorAll('.sw-space-hint').forEach(el => el.classList.remove('sw-hint-active'));
      const hint = document.getElementById(`swHint-${i}`);
      if (hint) { hint.classList.add('sw-hint-active'); hint.textContent = '✅ 스페이스바 준비 완료!'; }
    });
  });

  for (let i = 0; i < teams.length; i++) {
    if (timerRecords[i] != null) restoreTimerTeamUI(i);
  }
  if (teams.every((_, i) => timerRecords[i] != null)) {
    setTimeout(() => showTimerResult(), 0);
  }

  // 스페이스바는 활성 팀이 있어야 동작 — 첫 미완료 팀을 기본 선택 (카드 클릭 없이 사용 가능)
  const firstOpen = teams.findIndex((_, i) => timerRecords[i] == null);
  if (firstOpen >= 0) {
    timerActiveTeam = firstOpen;
    document.querySelectorAll('.sw-space-hint').forEach(el => el.classList.remove('sw-hint-active'));
    const hint = document.getElementById(`swHint-${firstOpen}`);
    if (hint) {
      hint.classList.add('sw-hint-active');
      hint.textContent = '✅ 스페이스바 준비 완료!';
    }
  }

  updateTimerVoiceUI();
}

// 원형 진행 바 업데이트 (0~10초 → 0~100%)
function updateStopwatchArc(teamIdx, elapsed) {
  const prog = document.getElementById(`swProg-${teamIdx}`);
  const timeEl = document.getElementById(`swTime-${teamIdx}`);
  if (!prog || !timeEl) return;
  const ratio   = Math.min(elapsed / 10, 1);
  const circum  = 263.9;
  prog.style.strokeDashoffset = circum - circum * ratio;
  // 10초 넘으면 빨간색으로
  if (elapsed > 10) {
    prog.style.stroke = '#ff4444';
  }
  timeEl.textContent = elapsed.toFixed(2);
}

function timerPress(teamIdx) {
  if (timerRunning) return;
  if (timerRecords[teamIdx] != null) return; // 이미 완료
  timerRunning     = true;
  timerCurrentTeam = teamIdx;
  timerStart       = Date.now();

  const btn = document.getElementById(`timerBtn-${teamIdx}`);
  if (btn) { btn.textContent = '⏱ 측정 중...'; btn.classList.add('timer-btn-active'); }

  // 진행 바 애니메이션
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - timerStart) / 1000;
    updateStopwatchArc(teamIdx, elapsed);
  }, 30);
}

function timerRelease(teamIdx) {
  if (!timerRunning || timerCurrentTeam !== teamIdx) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;

  const elapsed = (Date.now() - timerStart) / 1000;
  timerRecords[teamIdx] = elapsed;
  restoreTimerTeamUI(teamIdx);

  if (teams.every((_, i) => timerRecords[i] != null)) showTimerResult();
}

function updateTimerVoiceUI() {
  const btn = document.getElementById('btnTimerMic');
  const status = document.getElementById('timerVoiceStatus');
  if (btn) {
    if (timerVoiceEnabled) {
      btn.textContent = '🎙️ 마이크 모드 ON';
      btn.style.color = '#86efac';
      btn.style.borderColor = 'rgba(34,197,94,.45)';
      btn.style.background = 'rgba(34,197,94,.14)';
    } else {
      btn.textContent = '🎙️ 마이크 모드 OFF';
      btn.style.color = '#fda4af';
      btn.style.borderColor = 'rgba(255,255,255,.25)';
      btn.style.background = 'rgba(255,255,255,.08)';
    }
  }
  if (status) {
    status.textContent = timerVoiceEnabled ? '음성 대기 중... "멈춰"라고 말하세요' : '명령: "멈춰"';
  }
}

function clearTimerVoiceRestartTimer() {
  if (timerVoiceRestartTimer) {
    clearTimeout(timerVoiceRestartTimer);
    timerVoiceRestartTimer = null;
  }
}

function releaseTimerVoiceMediaStream() {
  if (timerVoiceMediaStream) {
    try { timerVoiceMediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
    timerVoiceMediaStream = null;
  }
}

async function acquireTimerSpeechMic() {
  releaseTimerVoiceMediaStream();
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    timerVoiceMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    return true;
  } catch (e) {
    return false;
  }
}

function stopTimerVoiceControl() {
  clearTimerVoiceRestartTimer();
  timerVoiceEnabled = false;
  if (timerVoiceRec) {
    try { timerVoiceRec.onresult = null; } catch(e) {}
    try { timerVoiceRec.onend = null; } catch(e) {}
    try { timerVoiceRec.onerror = null; } catch(e) {}
    try { timerVoiceRec.stop(); } catch(e) {}
    timerVoiceRec = null;
  }
  releaseTimerVoiceMediaStream();
  updateTimerVoiceUI();
}

function handleTimerVoiceCommand(text) {
  const cmd = (text || '').replace(/\s+/g, '').trim().toLowerCase();
  if (!cmd) return;
  if (!/(멈춰|그만|정지|스탑|stop)/.test(cmd)) return;
  if (!timerRunning) return;
  timerRelease(timerCurrentTeam);
}

async function toggleTimerVoiceControl() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const status = document.getElementById('timerVoiceStatus');
    if (status) status.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다.';
    return;
  }

  if (timerVoiceEnabled) {
    stopTimerVoiceControl();
    return;
  }

  const micOk = await acquireTimerSpeechMic();
  if (!micOk) {
    const status = document.getElementById('timerVoiceStatus');
    if (status) status.textContent = '마이크 권한을 허용해 주세요. (주소창 자물쇠)';
    return;
  }

  try {
    timerVoiceRec = new SR();
    timerVoiceRec.lang = 'ko-KR';
    timerVoiceRec.continuous = !IS_APPLE_TOUCH_DEVICE;
    timerVoiceRec.interimResults = false;
    timerVoiceRec.maxAlternatives = 1;

    timerVoiceRec.onresult = (evt) => {
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        const text = evt.results[i][0]?.transcript?.trim() || '';
        if (text) handleTimerVoiceCommand(text);
      }
    };
    timerVoiceRec.onerror = (ev) => {
      const err = ev.error || '';
      if (err === 'aborted' || err === 'no-speech') return;
      clearTimerVoiceRestartTimer();
      stopTimerVoiceControl();
      const status = document.getElementById('timerVoiceStatus');
      if (status) {
        status.textContent = (err === 'not-allowed' || err === 'service-not-allowed')
          ? '마이크 권한을 허용해 주세요.'
          : '마이크 오류로 종료되었습니다.';
      }
    };
    const tRestart = IS_APPLE_TOUCH_DEVICE ? 480 : 360;
    timerVoiceRec.onend = () => {
      if (!timerVoiceEnabled || !timerVoiceRec) return;
      clearTimerVoiceRestartTimer();
      timerVoiceRestartTimer = setTimeout(() => {
        timerVoiceRestartTimer = null;
        if (!timerVoiceEnabled || !timerVoiceRec) return;
        try { timerVoiceRec.start(); } catch (e) {}
      }, tRestart);
    };

    timerVoiceRec.start();
    timerVoiceEnabled = true;
    updateTimerVoiceUI();
  } catch(e) {
    stopTimerVoiceControl();
    const status = document.getElementById('timerVoiceStatus');
    if (status) status.textContent = '마이크 시작 실패. 권한을 확인하세요.';
  }
}

function showTimerResult() {
  // 오차가 작을수록 좋음 → higherIsBetter = false (미기록은 diff 999)
  const diffs = teams.map((_, i) => ({
    teamIdx : i,
    elapsed : timerRecords[i],
    diff    : timerRecords[i] != null ? Math.abs(timerRecords[i] - 10) : 999,
  }));
  diffs.sort((a, b) => a.diff - b.diff);

  // 순위별 보너스 계산 (동점 처리) — TIMER_BONUS_POINTS 사용
  const diffValues = teams.map((_, i) => timerRecords[i] != null ? Math.abs(timerRecords[i] - 10) : 999);
  const bonuses    = rankToBonus(diffValues, false, TIMER_BONUS_POINTS);

  const rankEmojis = ['🥇','🥈','🥉','4위'];
  const statusEl = document.getElementById('timerStatus');
  statusEl.innerHTML = `<div class="timer-result">
    <div class="timer-result-title">⏱ 10초 맞추기 결과</div>
    ${diffs.map((d, rank) => {
      const pts = bonuses[d.teamIdx];
      const isTop = rank === 0;
      const elapsedStr = d.elapsed != null ? `${d.elapsed.toFixed(2)}초` : '미기록';
      const ochaStr    = d.elapsed != null ? `오차 ${d.diff.toFixed(2)}초` : '—';
      return `<div class="timer-result-row ${isTop ? 'timer-winner' : ''}">
        <span class="timer-rank">${rankEmojis[Math.min(rank,3)]}</span>
        <span style="color:${TEAM_COLORS[d.teamIdx]}">${TEAM_EMOJIS[d.teamIdx]} ${TEAM_NAMES[d.teamIdx]}</span>
        <span class="timer-elapsed">${elapsedStr}</span>
        <span class="timer-ocha">${ochaStr}</span>
        <span class="timer-bonus-badge">+${pts}점</span>
      </div>`;
    }).join('')}
  </div>`;
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── 최종 점수 계산 ────────────────────────────────────
function calculateAndShowResult() {
  const tc   = CFG.teamCount;
  const idxs = Array.from({length: tc}, (_, i) => i);
  const s1   = idxs.map(i => parseInt(document.getElementById(`score1-${i}`)?.value || 0));
  const s2   = gameMode === 2 ? idxs.map(i => parseInt(document.getElementById(`score2-${i}`)?.value || 0)) : idxs.map(() => 0);

  const bowling = s1.map((v, i) => v + s2[i]);

  // ── 인형뽑기 보너스 계산 ─────────────────────────────
  // 선택된 보너스 게임에 따라 계산
  const dolls = idxs.map(i => parseInt(document.getElementById(`doll-${i}`)?.value || 0));
  let dollBonus  = idxs.map(() => 0);
  let timerBonus = idxs.map(() => 0);

  // 인형뽑기 보너스 (선택된 경우)
  if (bonusGameDoll) {
    if (Math.max(...dolls) > 0) {
      dollBonus = rankToBonus(dolls, true, DOLL_BONUS_POINTS);
    }
  }
  // 10초 게임 보너스 (선택된 경우) — 한 팀이라도 기록되면 순위 반영, 미기록 팀은 999(꼴찌 취급)
  if (bonusGameTimer) {
    const anyTimer = idxs.some(i => timerRecords[i] != null);
    if (anyTimer) {
      const timerDiffs = idxs.map(i =>
        timerRecords[i] != null ? Math.abs(timerRecords[i] - 10) : 999
      );
      timerBonus = rankToBonus(timerDiffs, false, TIMER_BONUS_POINTS);
    }
  }

  const total = bowling.map((v, i) => v + dollBonus[i] + timerBonus[i]);
  const ranked = idxs.map(i => ({
    teamIdx      : i,
    bowling      : bowling[i],
    dollBonus    : dollBonus[i],
    timerBonus   : timerBonus[i],
    total        : total[i],
    dolls        : dolls[i],
    timerElapsed : timerRecords[i],
  })).sort((a, b) => b.total - a.total);

  window._ranked = ranked;
  if (gameMode === 2) {
    buildRematchGrid(ranked);
    showSlide('slide-rematch');
    startConfetti('confettiCanvas3');
    playFireworkSound();
  } else {
    buildResultGrid(ranked);
    showSlide('slide-result');
    startFireworks();
    playFireworkSound();
    stopBowlingBGM();
  }
}

// ── 2게임 재대진 ──────────────────────────────────────
function buildRematchGrid(ranked) {
  const tc = CFG.teamCount;
  document.getElementById('rematchGrid').innerHTML = `
    <div class="rematch-card">
      <div class="rematch-label">🏆 결승전</div>
      <div class="rematch-lane-badge">LANE 1 · 2</div>
      <div class="rematch-teams">
        <div class="rematch-team" style="color:${TEAM_COLORS[ranked[0].teamIdx]}">${TEAM_EMOJIS[ranked[0].teamIdx]} ${TEAM_NAMES[ranked[0].teamIdx]}<span class="rematch-score">1게임 ${ranked[0].bowling}점</span></div>
        <div class="rematch-vs">VS</div>
        <div class="rematch-team" style="color:${TEAM_COLORS[ranked[1].teamIdx]}">${TEAM_EMOJIS[ranked[1].teamIdx]} ${TEAM_NAMES[ranked[1].teamIdx]}<span class="rematch-score">1게임 ${ranked[1].bowling}점</span></div>
      </div>
    </div>
    ${tc > 2 ? `<div class="rematch-card">
      <div class="rematch-label">🎯 나머지 팀 추가 게임</div>
      <div class="rematch-lane-badge">LANE 3+</div>
      <div class="rematch-teams">
        ${ranked.slice(2).map(r => `<div class="rematch-team" style="color:${TEAM_COLORS[r.teamIdx]}">${TEAM_EMOJIS[r.teamIdx]} ${TEAM_NAMES[r.teamIdx]}<span class="rematch-score">1게임 ${r.bowling}점</span></div>`).join('<div class="rematch-vs">VS</div>')}
      </div>
    </div>` : ''}`;
}

// ── 최종 시상 ─────────────────────────────────────────
const PRIZE_CLASSES = ['rank-1','rank-2','rank-3','rank-4','rank-4','rank-4'];

function buildResultGrid(ranked) {
  const tc = CFG.teamCount;
  const gridEl = document.getElementById('resultGrid');
  // 팀 수에 따라 그리드 컬럼 동적 조정
  if (tc === 3) {
    gridEl.classList.add('result-grid-3');
    gridEl.style.gridTemplateColumns = 'repeat(3, 1fr)';
  } else if (tc === 2) {
    gridEl.style.gridTemplateColumns = 'repeat(2, 1fr)';
  } else {
    gridEl.style.gridTemplateColumns = `repeat(${Math.min(tc, 3)}, 1fr)`;
  }

  gridEl.innerHTML = ranked.map((r, pos) => {
    const timerStr = r.timerElapsed != null ? r.timerElapsed.toFixed(2) + '초' : '미측정';
    const rankMedals = ['🥇','🥈','🥉','🎖','🎖','🎖'];
    // 보너스 배지
    const dollBadge  = r.dollBonus > 0
      ? `<span class="bonus-tag doll-bonus">🧸 인형뽑기 +${r.dollBonus}점</span>` : '';
    const timerBadge = r.timerBonus > 0
      ? `<span class="bonus-tag timer-bonus">⏱ 10초게임 +${r.timerBonus}점 <small>(${timerStr})</small></span>` : '';

    return `<div class="result-card ${PRIZE_CLASSES[pos]} fade-in" style="--delay:${pos*0.3}s">
       <div class="result-rank">${rankMedals[pos]} ${pos+1}위</div>
       <div class="result-team-name" style="color:${TEAM_COLORS[r.teamIdx]}">${TEAM_EMOJIS[r.teamIdx]} ${TEAM_NAMES[r.teamIdx]}</div>
       <div class="result-members">${teams[r.teamIdx].join(' · ')}</div>
       ${(clawRepByTeam[r.teamIdx] && bonusGameDoll) ? `<div class="result-rep">🧸 인형뽑기 대표: ${clawRepByTeam[r.teamIdx]}</div>` : ''}
       <div class="result-scores">
         <span class="bowling-score">🎳 볼링 ${r.bowling}점</span>
         ${dollBadge}
         ${timerBadge}
         <span class="total-score">합계 ${r.total}점</span>
       </div>
       ${CFG.prizes[pos] ? `<div class="result-prize">${rankMedals[pos]} ${CFG.prizes[pos]} 외식상품권</div>` : ''}
     </div>`;
  }).join('');
}

// ── 초기화 ────────────────────────────────────────────
function resetAll() {
  teams = []; rawTeams = []; gameMode = 1; pickIndex = 0;
  isAutoMode = false; isPicking = false; balanceSwapLog = [];
  clawRepByTeam = [];
  timerRecords = {}; timerRunning = false; timerActiveTeam = -1;
  stopTimerVoiceControl();
  bonusGameDoll  = true;
  bonusGameTimer = true;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  stopFireworks();
  stopBowlingBGM();
  showSlide('slide-setup');
}

// ── DOMContentLoaded ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // ─── claw.html에서 복귀: 앱 상태 복원 후 slide-scores로 이동 ───
  if (window.location.hash === '#slide-scores') {
    try {
      const raw = localStorage.getItem('bowlingAppState');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.CFG)         Object.assign(CFG, s.CFG);
        if (s.TEAM_COLORS) TEAM_COLORS = s.TEAM_COLORS;
        if (s.TEAM_NAMES)  TEAM_NAMES  = s.TEAM_NAMES;
        if (s.TEAM_EMOJIS) TEAM_EMOJIS = s.TEAM_EMOJIS;
        if (s.teams)       teams       = s.teams;
        if (s.rawTeams)    rawTeams    = s.rawTeams;
        if (s.gameMode !== undefined) gameMode = s.gameMode;
        if (s.bonusGameDoll  !== undefined) bonusGameDoll  = s.bonusGameDoll;
        if (s.bonusGameTimer !== undefined) bonusGameTimer = s.bonusGameTimer;
        if (s.clawRepByTeam && Array.isArray(s.clawRepByTeam)) clawRepByTeam = s.clawRepByTeam;
        if (s.timerRecords && typeof s.timerRecords === 'object') {
          timerRecords = {};
          Object.keys(s.timerRecords).forEach(k => {
            const ki = parseInt(k, 10);
            if (!Number.isNaN(ki) && s.timerRecords[k] != null) timerRecords[ki] = s.timerRecords[k];
          });
        }
        // 슬라이드10 UI 빌드 후 바로 표시
        showSlide('slide-scores');
        buildScoreTables();
        updateBGMBtn();
        // 해시 제거 (새로고침 시 반복 실행 방지)
        history.replaceState(null, '', window.location.pathname);
        return; // 나머지 초기화 건너뜀
      }
    } catch(e) { console.warn('앱 상태 복원 실패:', e); }
  }

  // 설정 화면 초기화
  const nameInput = document.getElementById('nameInput');
  nameInput.value = DEFAULT_NAMES.join('\n');

  // 팀 수 기본값 3, 레인 수 기본값 4
  document.getElementById('teamCount').textContent = '3';
  document.getElementById('laneCount').textContent = '4';
  updateSetupUI();
  startStars('starCanvas');

  // ── 이름 입력 시 고수/초보 칩 즉시 갱신 ─────────────
  nameInput.addEventListener('input', () => {
    renderSkillChips();
    updateSetupUI();
  });

  document.addEventListener('keydown', e => {
    const active = document.querySelector('.slide.active');
    if ((e.key === ' ' || e.key === 'Enter') && active?.id === 'slide-opening') { e.preventDefault(); nextSlide(); return; }
    if (e.key === 'Escape' && active?.id !== 'slide-setup') resetAll();

    // 스페이스바 → 10초 맞추기 게임 제어 (기본 스크롤 방지)
    const isSpace = e.key === ' ' || e.code === 'Space';
    if (isSpace && active?.id === 'slide-scores') {
      e.preventDefault();
      if (!bonusGameTimer) return;
      if (timerActiveTeam < 0) return;
      if (!timerRunning && timerRecords[timerActiveTeam] == null) {
        timerPress(timerActiveTeam);
      }
    }
  });

  document.addEventListener('keyup', e => {
    const active = document.querySelector('.slide.active');
    const isSpace = e.key === ' ' || e.code === 'Space';
    if (isSpace && active?.id === 'slide-scores') {
      if (bonusGameTimer) e.preventDefault();
      if (!bonusGameTimer) return;
      if (timerRunning && timerCurrentTeam === timerActiveTeam) {
        timerRelease(timerActiveTeam);
      }
    }
  });

  updateBGMBtn();
});
