/**
 * 한글 게임용 경쾌한 배경음 (Web Audio 합성, 외부 파일 없음)
 */
const NOTE = {
  C3: 130.81,
  G3: 196.0,
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

const MELODY = [
  [0, NOTE.E5, 1],
  [1, NOTE.G5, 1],
  [2, NOTE.E5, 1],
  [3, NOTE.C5, 1],
  [4, NOTE.D5, 1],
  [5, NOTE.E5, 1],
  [6, NOTE.G5, 1],
  [7, NOTE.C5, 1],
];

const BASS = [
  [0, NOTE.C3, 2],
  [2, NOTE.G3, 2],
  [4, NOTE.C3, 2],
  [6, NOTE.E4, 1],
  [7, NOTE.G3, 1],
];

const CHORD_HITS = [
  [0, [NOTE.C4, NOTE.E4, NOTE.G4]],
  [4, [NOTE.C4, NOTE.E4, NOTE.G4]],
];

const BPM = 128;
const BEAT_SEC = 60 / BPM;
const LOOP_BEATS = 8;
const LOOP_SEC = LOOP_BEATS * BEAT_SEC;

function playTone(ctx, dest, startTime, freq, durationSec, type = 'triangle', peak = 0.11) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  const a = startTime;
  const b = startTime + 0.025;
  const c = startTime + Math.max(0.06, durationSec - 0.04);
  const d = startTime + durationSec;
  g.gain.setValueAtTime(0.001, a);
  g.gain.linearRampToValueAtTime(peak, b);
  g.gain.linearRampToValueAtTime(peak * 0.6, c);
  g.gain.linearRampToValueAtTime(0.001, d);
  osc.connect(g);
  g.connect(dest);
  osc.start(startTime);
  osc.stop(d + 0.02);
}

function playBass(ctx, dest, startTime, freq, durationSec) {
  playTone(ctx, dest, startTime, freq, durationSec, 'sine', 0.17);
}

function playChordHit(ctx, dest, startTime, freqs) {
  freqs.forEach((f, i) => {
    playTone(ctx, dest, startTime + i * 0.01, f, BEAT_SEC * 1.75, 'triangle', 0.042);
  });
}

function scheduleLoopChunk(ctx, master, t0) {
  MELODY.forEach(([beat, freq, len]) => {
    const dur = Math.max(0.08, len * BEAT_SEC - 0.03);
    playTone(ctx, master, t0 + beat * BEAT_SEC, freq, dur, 'triangle', 0.1);
  });
  BASS.forEach(([beat, freq, len]) => {
    const dur = Math.max(0.1, len * BEAT_SEC - 0.03);
    playBass(ctx, master, t0 + beat * BEAT_SEC, freq, dur);
  });
  CHORD_HITS.forEach(([beat, freqs]) => {
    playChordHit(ctx, master, t0 + beat * BEAT_SEC, freqs);
  });
}

export function createHangulBgm() {
  let ctx = null;
  let master = null;
  let timer = null;
  let running = false;
  let anchorTime = null;

  function ensureContext() {
    if (ctx) return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    return ctx;
  }

  function tick() {
    if (!running || !ctx || !master) return;
    if (anchorTime == null) anchorTime = ctx.currentTime + 0.08;
    scheduleLoopChunk(ctx, master, anchorTime);
    anchorTime += LOOP_SEC;
    const delayMs = Math.max(8, (anchorTime - ctx.currentTime) * 1000 - 25);
    timer = window.setTimeout(tick, delayMs);
  }

  return {
    async start() {
      const c = ensureContext();
      if (!c) return false;
      if (c.state === 'suspended') await c.resume();
      running = true;
      anchorTime = null;
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      tick();
      return true;
    },

    stop() {
      running = false;
      anchorTime = null;
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
    },

    setMuted(muted) {
      if (master) master.gain.value = muted ? 0 : 0.9;
    },

    isRunning() {
      return running;
    },

    dispose() {
      this.stop();
      if (ctx) {
        ctx.close?.();
        ctx = null;
        master = null;
      }
    },
  };
}
