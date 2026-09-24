/**
 * 틀렸을 때 재생하는 짧은 징글 (합성음, 외부 파일 없음)
 * 배경음과 동일하게 hangul-bgm-muted 시 무음.
 */

const LS_MUTED = 'hangul-bgm-muted';

let ctxRef = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctxRef || ctxRef.state === 'closed') {
    ctxRef = new Ctx();
  }
  return ctxRef;
}

function scheduleDing(ctx, dest, t0, freq, durationSec, peak = 0.2) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  const end = t0 + durationSec;
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.018);
  g.gain.exponentialRampToValueAtTime(0.001, end);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(end + 0.02);
}

function scheduleSlide(ctx, dest, t0, fStart, fEnd, durationSec, peak = 0.18) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(fStart, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(80, fEnd), t0 + durationSec);
  const end = t0 + durationSec;
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, end);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(end + 0.03);
}

/**
 * '띵띵띵띠~~~~' 느낌의 짧은 실패 팡파레 (3연 띵 + 내리는 띠)
 */
export async function playHangulWrongJingle() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(LS_MUTED) === '1') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.92;
    master.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.02;
    // 띵 띵 띵 (살짝 내려가는 짧은 삑)
    scheduleDing(ctx, master, t0, 784, 0.1, 0.19);
    scheduleDing(ctx, master, t0 + 0.11, 698, 0.1, 0.17);
    scheduleDing(ctx, master, t0 + 0.22, 622, 0.1, 0.16);
    // 띠~~~~ (길게 내려감)
    scheduleSlide(ctx, master, t0 + 0.36, 466, 130, 0.72, 0.2);

    const cleanupAt = (t0 + 0.36 + 0.72 + 0.1) * 1000;
    window.setTimeout(() => {
      try {
        master.disconnect();
      } catch {
        /* ignore */
      }
    }, cleanupAt);
  } catch {
    /* ignore */
  }
}

/** 징글("띵띵띵띠~")이 끝나는 시점 */
const SAY_AFTER_JINGLE_MS = 1100;

/**
 * 오답 징글을 울리고, 끝나면 "<word>! 아니에요~"를 읽어 준다.
 * @returns {() => void} 아직 읽기 전이면 읽기를 취소하는 함수
 */
export function playWrongJingleThenSay(word) {
  if (typeof window === 'undefined') return () => {};
  if (localStorage.getItem(LS_MUTED) === '1') return () => {};

  void playHangulWrongJingle();
  const timer = window.setTimeout(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(`${word}! 아니에요~`);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  }, SAY_AFTER_JINGLE_MS);

  return () => window.clearTimeout(timer);
}
