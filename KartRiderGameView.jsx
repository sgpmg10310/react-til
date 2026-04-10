import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './KartRiderGameView.module.css';

const W = 800;
const H = 480;
const WORLD_W = 1280;
const WORLD_H = 800;
const KART_R = 16;

const MAPS = [
  {
    id: 'circuit',
    name: '시티 서킷',
    grass: '#166534',
    kerb: '#14532d',
    start: { x: 200, y: 400, angle: 0 },
    walls: [
      { x: 0, y: 0, w: WORLD_W, h: 40 },
      { x: 0, y: WORLD_H - 40, w: WORLD_W, h: 40 },
      { x: 0, y: 0, w: 40, h: WORLD_H },
      { x: WORLD_W - 40, y: 0, w: 40, h: WORLD_H },
      { x: 320, y: 180, w: 120, h: 360 },
      { x: 680, y: 120, w: 120, h: 420 },
    ],
  },
  {
    id: 'beach',
    name: '비치 로드',
    grass: '#0d9488',
    kerb: '#0f766e',
    start: { x: 640, y: 200, angle: Math.PI / 2 },
    walls: [
      { x: 0, y: 0, w: WORLD_W, h: 50 },
      { x: 0, y: WORLD_H - 50, w: WORLD_W, h: 50 },
      { x: 0, y: 0, w: 50, h: WORLD_H },
      { x: WORLD_W - 50, y: 0, w: 50, h: WORLD_H },
      { x: 200, y: 280, w: 400, h: 80 },
      { x: 720, y: 420, w: 200, h: 90 },
      { x: 500, y: 80, w: 90, h: 200 },
    ],
  },
  {
    id: 'factory',
    name: '팩토리 야드',
    grass: '#57534e',
    kerb: '#44403c',
    start: { x: 400, y: 640, angle: -Math.PI / 2 },
    walls: [
      { x: 0, y: 0, w: WORLD_W, h: 45 },
      { x: 0, y: WORLD_H - 45, w: WORLD_W, h: 45 },
      { x: 0, y: 0, w: 45, h: WORLD_H },
      { x: WORLD_W - 45, y: 0, w: 45, h: WORLD_H },
      { x: 250, y: 200, w: 700, h: 60 },
      { x: 250, y: 520, w: 520, h: 60 },
      { x: 150, y: 360, w: 80, h: 200 },
      { x: 900, y: 300, w: 80, h: 240 },
    ],
  },
];

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function circleRectResolve(cx, cy, r, rect) {
  const closestX = clamp(cx, rect.x, rect.x + rect.w);
  const closestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  const d = Math.sqrt(d2) || 0.0001;
  const nx = dx / d;
  const ny = dy / d;
  const overlap = r - d;
  return { nx, ny, overlap };
}

export default function KartRiderGameView() {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const rafRef = useRef(0);
  const mapIndexRef = useRef(0);
  const playingRef = useRef(false);

  const physicsRef = useRef({
    x: MAPS[0].start.x,
    y: MAPS[0].start.y,
    angle: MAPS[0].start.angle,
    speed: 0,
    driftGauge: 0,
    boostFlash: 0,
  });

  const [mapIndex, setMapIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ speed: 0, drift: 0, boost: false });

  const getMap = useCallback(() => MAPS[mapIndexRef.current], []);

  const resetKartToMap = useCallback(() => {
    const m = MAPS[mapIndexRef.current];
    const p = physicsRef.current;
    p.x = m.start.x;
    p.y = m.start.y;
    p.angle = m.start.angle;
    p.speed = 0;
    p.driftGauge = 0;
    p.boostFlash = 0;
  }, []);

  useEffect(() => {
    mapIndexRef.current = mapIndex;
    if (!playingRef.current) resetKartToMap();
  }, [mapIndex, resetKartToMap]);

  useEffect(() => {
    const down = e => {
      const k = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(k) || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
      }
      if (k === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysRef.current.shift = true;
      }
      keysRef.current[k] = true;
    };
    const up = e => {
      const k = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(k) || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
      }
      if (k === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysRef.current.shift = false;
        const p = physicsRef.current;
        if (p.driftGauge >= 38) {
          const mult = clamp(p.driftGauge / 100, 0.35, 1);
          p.speed += 220 * mult;
          p.boostFlash = 0.35;
        }
        p.driftGauge = 0;
      }
      keysRef.current[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const keys = keysRef.current;
      const p = physicsRef.current;
      const map = getMap();
      const dt = 1 / 60;
      const shiftHeld = keys.shift === true;

      if (playingRef.current) {
        let throttle = 0;
        if (keys.ArrowUp) throttle += 1;
        if (keys.ArrowDown) throttle -= 0.55;

        const steerInput = (keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0);
        const shift = shiftHeld;
        const minDriftSpeed = 95;

        const grip = shift && Math.abs(steerInput) > 0 && Math.abs(p.speed) > minDriftSpeed ? 0.42 : 1;
        const turnBase = 2.45 * grip;
        const steerMag = Math.abs(p.speed) > 8 ? turnBase * clamp(Math.abs(p.speed) / 220, 0.35, 1.2) : turnBase * 0.5;

        p.angle += steerInput * steerMag * dt * Math.sign(p.speed || 1);

        if (shift && Math.abs(steerInput) > 0 && Math.abs(p.speed) > minDriftSpeed) {
          p.driftGauge = clamp(p.driftGauge + dt * 42, 0, 100);
        } else if (!shift) {
          p.driftGauge = Math.max(0, p.driftGauge - dt * 18);
        }

        const accel = 420 * throttle - 0.22 * p.speed - (shift ? 0.08 * p.speed : 0);
        p.speed += accel * dt;
        p.speed *= 0.985;
        p.speed = clamp(p.speed, -120, 320);

        const vx = Math.cos(p.angle) * p.speed * dt;
        const vy = Math.sin(p.angle) * p.speed * dt;
        p.x += vx;
        p.y += vy;

        for (const w of map.walls) {
          const hit = circleRectResolve(p.x, p.y, KART_R, w);
          if (hit) {
            p.x += hit.nx * hit.overlap;
            p.y += hit.ny * hit.overlap;
            const vn = p.speed;
            p.speed = -vn * 0.35;
          }
        }

        p.x = clamp(p.x, KART_R + 2, WORLD_W - KART_R - 2);
        p.y = clamp(p.y, KART_R + 2, WORLD_H - KART_R - 2);

      }

      if (p.boostFlash > 0) p.boostFlash -= dt;

      const camX = clamp(p.x - W / 2, 0, WORLD_W - W);
      const camY = clamp(p.y - H / 2, 0, WORLD_H - H);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.fillStyle = map.grass;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      ctx.strokeStyle = map.kerb;
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, WORLD_W - 40, WORLD_H - 40);

      ctx.fillStyle = '#334155';
      for (const w of map.walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.boostFlash > 0 ? '#fbbf24' : '#38bdf8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18 + 6, -10);
      ctx.lineTo(18 - 6, -10);
      ctx.quadraticCurveTo(18, -10, 18, -10 + 6);
      ctx.lineTo(18, 10 - 6);
      ctx.quadraticCurveTo(18, 10, 18 - 6, 10);
      ctx.lineTo(-18 + 6, 10);
      ctx.quadraticCurveTo(-18, 10, -18, 10 - 6);
      ctx.lineTo(-18, -10 + 6);
      ctx.quadraticCurveTo(-18, -10, -18 + 6, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(10, -6, 8, 12);
      ctx.restore();

      if (shiftHeld && p.driftGauge > 5) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 3; i += 1) {
          const bx = p.x - Math.cos(p.angle) * (24 + i * 10) + Math.sin(p.angle) * (i % 2 === 0 ? 6 : -6);
          const by = p.y - Math.sin(p.angle) * (24 + i * 10) - Math.cos(p.angle) * (i % 2 === 0 ? 6 : -6);
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      ctx.fillStyle = 'rgba(15,23,42,0.55)';
      ctx.fillRect(8, 8, 190, 62);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px system-ui,sans-serif';
      ctx.fillText(`속도 ${Math.round(Math.abs(p.speed))} km/h`, 18, 30);
      ctx.fillText(`드리프트 ${Math.round(p.driftGauge)}%`, 18, 52);
      if (p.boostFlash > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('부스트!', 18, 74);
      }

      setHud({
        speed: Math.round(Math.abs(p.speed)),
        drift: Math.round(p.driftGauge),
        boost: p.boostFlash > 0,
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getMap]);

  useEffect(() => {
    playingRef.current = playing;
    if (playing) resetKartToMap();
  }, [playing, resetKartToMap]);

  const startRace = () => {
    resetKartToMap();
    setPlaying(true);
  };

  const stopRace = () => {
    setPlaying(false);
    resetKartToMap();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏎️ 카트 라이더 스타일 (맵 선택 · 방향키 · Shift 드리프트)</h1>
        <p className={styles.sub}>맵을 고른 뒤 레이스 시작을 누르고, 캔버스를 클릭한 다음 키보드로 조작하세요.</p>
      </header>

      <div className={styles.mapSelect} role="group" aria-label="맵 선택">
        {MAPS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.mapBtn} ${mapIndex === i ? styles.mapBtnActive : ''}`}
            onClick={() => {
              setMapIndex(i);
              mapIndexRef.current = i;
            }}
            disabled={playing}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className={styles.startRow}>
        <button type="button" className={styles.startBtn} onClick={startRace} disabled={playing}>
          레이스 시작
        </button>
        <button type="button" className={styles.startBtn} style={{ background: '#475569' }} onClick={stopRace} disabled={!playing}>
          정지 / 맵 바꾸기
        </button>
      </div>

      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={W}
          height={H}
          tabIndex={0}
          role="img"
          aria-label="카트 레이스 필드"
        />
      </div>

      <div className={styles.hud}>
        <span>
          상태: <strong>{playing ? '주행 중' : '대기'}</strong>
        </span>
        <span>
          HUD: <strong>{hud.speed}</strong> km/h · 드리프트 <strong>{hud.drift}</strong>%
          {hud.boost ? ' · 부스트' : ''}
        </span>
      </div>

      <div className={styles.help}>
        <strong>조작:</strong> ↑ 가속 · ↓ 후진/브레이크 · ← → 조향 · <strong>Shift</strong> 누른 채로 회전하면 드리프트 게이지가 쌓이고,
        <strong> Shift를 떼면</strong> 게이지에 따라 순간 부스트가 들어갑니다. 벽에 부딪히면 감속합니다.
      </div>

      <Link to="/" className={styles.home}>
        ← 홈으로
      </Link>
    </div>
  );
}
