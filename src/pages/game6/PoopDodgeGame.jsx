import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PoopDodgeGame.module.css';

/** 그림(이모지)에 맞는 한글 단어 고르기 — 틀리거나 시간 초과 시 똥 피격 */
const WORD_POOL = [
  { emoji: '🍎', answer: '사과', wrong: ['바나나', '포도', '수박'] },
  { emoji: '🐶', answer: '강아지', wrong: ['고양이', '토끼', '펭귄'] },
  { emoji: '🚌', answer: '버스', wrong: ['기차', '자전거', '비행기'] },
  { emoji: '☀️', answer: '해', wrong: ['달', '별', '구름'] },
  { emoji: '🌙', answer: '달', wrong: ['해', '별', '무지개'] },
  { emoji: '🍌', answer: '바나나', wrong: ['사과', '딸기', '수박'] },
  { emoji: '🐱', answer: '고양이', wrong: ['강아지', '곰', '사자'] },
  { emoji: '🚗', answer: '자동차', wrong: ['배', '로켓', '기차'] },
  { emoji: '🍕', answer: '피자', wrong: ['김밥', '빵', '초콜릿'] },
  { emoji: '🎈', answer: '풍선', wrong: ['선물', '모자', '시계'] },
  { emoji: '🐸', answer: '개구리', wrong: ['오리', '상어', '문어'] },
  { emoji: '🦁', answer: '사자', wrong: ['호랑이', '곰', '원숭이'] },
  { emoji: '🍉', answer: '수박', wrong: ['귤', '배', '딸기'] },
  { emoji: '⭐', answer: '별', wrong: ['달', '해', '구름'] },
  { emoji: '🎒', answer: '가방', wrong: ['신발', '모자', '양말'] },
];

const INITIAL_LIVES = 3;
const MIN_MS = 2400;
const BASE_MS = 8200;
const PER_LEVEL = 550;

function limitForLevel(lv) {
  return Math.max(MIN_MS, BASE_MS - (lv - 1) * PER_LEVEL);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound() {
  const item = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  const wrongPick = shuffle([...item.wrong]).slice(0, 3);
  const choices = shuffle([item.answer, ...wrongPick]);
  return { emoji: item.emoji, answer: item.answer, choices };
}

function playSplatSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const dur = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * 0.55;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.55;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close?.();
  } catch {
    /* ignore */
  }
}

function playGroan() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance('흐억…!');
  u.lang = 'ko-KR';
  u.rate = 0.72;
  u.pitch = 0.45;
  window.speechSynthesis.speak(u);
}

export default function PoopDodgeGame() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [round, setRound] = useState(() => pickRound());
  const [bearHit, setBearHit] = useState(false);
  const [splat, setSplat] = useState(false);
  const [poopFalling, setPoopFalling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [activeLimitMs, setActiveLimitMs] = useState(() => limitForLevel(1));

  const roundIdRef = useRef(0);
  const deadlineRef = useRef(0);
  const rafRef = useRef(0);
  const gameOverRef = useRef(false);
  const frozenRef = useRef(false);
  const levelRef = useRef(1);

  levelRef.current = level;
  gameOverRef.current = gameOver;
  frozenRef.current = frozen;

  const beginRound = useCallback(() => {
    const limit = limitForLevel(levelRef.current);
    setActiveLimitMs(limit);
    roundIdRef.current += 1;
    const id = roundIdRef.current;
    setRound(pickRound());
    setBearHit(false);
    setSplat(false);
    setPoopFalling(false);
    frozenRef.current = false;
    setFrozen(false);
    setFeedback('');
    setTimeLeft(1);
    deadlineRef.current = Date.now() + limit;
    requestAnimationFrame(() => {
      if (roundIdRef.current !== id) return;
      setPoopFalling(true);
    });
  }, []);

  const loseLifeAndMaybeEnd = useCallback(() => {
    setLives((L) => {
      const next = L - 1;
      if (next <= 0) {
        setGameOver(true);
        gameOverRef.current = true;
      }
      return next;
    });
  }, []);

  const triggerHit = useCallback(() => {
    if (frozenRef.current || gameOverRef.current) return;
    frozenRef.current = true;
    setFrozen(true);
    setBearHit(true);
    setSplat(true);
    playSplatSound();
    playGroan();
    loseLifeAndMaybeEnd();
    setFeedback('똥을 맞았다! 곰이 흐억… 🤢');
    setTimeout(() => {
      setBearHit(false);
      setSplat(false);
      setPoopFalling(false);
      if (!gameOverRef.current) beginRound();
    }, 2200);
  }, [beginRound, loseLifeAndMaybeEnd]);

  const onTimeUpRef = useRef(() => {});
  onTimeUpRef.current = () => {
    if (gameOverRef.current || frozenRef.current) return;
    triggerHit();
  };

  useEffect(() => {
    if (!started || gameOver || frozen) return undefined;

    const limit = activeLimitMs;
    const tick = () => {
      const left = Math.max(0, (deadlineRef.current - Date.now()) / limit);
      setTimeLeft(left);
      if (left <= 0) {
        onTimeUpRef.current();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver, frozen, round.answer, activeLimitMs]);

  const handleChoice = (word) => {
    if (frozen || gameOver || !started) return;
    if (word === round.answer) {
      frozenRef.current = true;
      setFrozen(true);
      setPoopFalling(false);
      setScore((s) => s + 1);
      setLevel((lv) => {
        const nl = lv + 1;
        levelRef.current = nl;
        return nl;
      });
      setFeedback(`정답! ${word} 🎉`);
      roundIdRef.current += 1;
      setTimeout(() => {
        beginRound();
      }, 650);
    } else {
      triggerHit();
    }
  };

  const startGame = () => {
    setStarted(true);
    setLevel(1);
    levelRef.current = 1;
    setScore(0);
    setLives(INITIAL_LIVES);
    setGameOver(false);
    gameOverRef.current = false;
    setFeedback('');
    frozenRef.current = false;
    setFrozen(false);
    queueMicrotask(() => beginRound());
  };

  const poopStyle = poopFalling
    ? { animationDuration: `${activeLimitMs}ms` }
    : undefined;

  const lostHearts = INITIAL_LIVES - lives;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>6. 한글 똥 피하기 💩🐻</h2>
      <p className={styles.sub}>
        그림에 맞는 단어를 골라요! 시간 안에 못 고르면… 무서운 곰 인형한테 똥이 떨어져요.
      </p>

      <div className={styles.hud}>
        <span>
          단계: <strong>{level}</strong>
        </span>
        <span>
          점수: <strong>{score}</strong>
        </span>
        <span className={styles.lives}>
          {'❤️'.repeat(Math.max(0, lives))}
          {lostHearts > 0 ? '🖤'.repeat(lostHearts) : ''}
        </span>
      </div>

      <div className={styles.stage}>
        <span className={styles.cloud} style={{ left: '8%' }}>
          ☁️
        </span>
        <span className={styles.cloud} style={{ left: '72%' }}>
          ☁️
        </span>

        <div className={styles.timerTrack}>
          <div
            className={styles.timerFill}
            style={{ transform: `scaleX(${timeLeft})` }}
          />
        </div>

        {started && !gameOver && (
          <div
            className={`${styles.poop} ${poopFalling ? styles.poopFall : styles.poopIdle}`}
            style={poopStyle}
            aria-hidden
          >
            💩
          </div>
        )}

        {splat && (
          <div className={`${styles.splat} ${styles.splatShow}`} aria-hidden>
            💥
          </div>
        )}

        <div className={styles.bearZone}>
          <span
            className={`${styles.bear} ${bearHit ? styles.bearHit : styles.bearNormal}`}
            aria-hidden
          >
            🐻
          </span>
          {bearHit && (
            <span className={styles.sillyOverlay} aria-hidden>
              😵
            </span>
          )}
        </div>
      </div>

      <div className={styles.hintBox}>
        <p className={styles.hintLabel}>이건 뭘까요?</p>
        <div className={styles.hintEmoji}>{round.emoji}</div>
      </div>

      <div
        className={styles.choiceGrid}
        key={`${round.emoji}-${round.answer}-${round.choices.join()}`}
      >
        {round.choices.map((w) => (
          <button
            key={w}
            type="button"
            className={styles.choiceBtn}
            disabled={!started || gameOver || frozen}
            onClick={() => handleChoice(w)}
          >
            {w}
          </button>
        ))}
      </div>

      <p className={styles.feedback}>{feedback}</p>

      {gameOver && (
        <div className={styles.gameOver}>
          <strong>게임 오버!</strong> 점수 {score}점 · 마지막 단계 {level}
          <br />
          다시 도전해 보세요!
        </div>
      )}

      <div className={styles.controls}>
        {!started ? (
          <button type="button" className={styles.startBtn} onClick={startGame}>
            🎮 시작하기
          </button>
        ) : (
          <button
            type="button"
            className={styles.startBtn}
            onClick={() => {
              setStarted(false);
              setGameOver(false);
              gameOverRef.current = false;
              setLives(INITIAL_LIVES);
              setLevel(1);
              levelRef.current = 1;
              setScore(0);
              setFeedback('');
              frozenRef.current = false;
              setFrozen(false);
              setPoopFalling(false);
              setRound(pickRound());
            }}
          >
            🔄 처음부터
          </button>
        )}
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/hangul-game')}
        >
          게임 목록으로
        </button>
      </div>
    </div>
  );
}
