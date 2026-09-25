/**
 * 한글 게임 공용 목소리 — 오리지널 캐릭터 "신나는 실험 유튜버"
 * (특정 인물을 흉내 내지 않은 목소리)
 * - 감탄사·대사는 CHARACTER 목소리, 배울 글자·단어는 WORD 목소리로 또박또박 읽는다.
 * - 배경음 OFF(hangul-bgm-muted)와 무관하게 항상 읽는다.
 */

export const CHARACTER = { pitch: 1.4, rate: 1.15 };
export const WORD = { pitch: 1.1, rate: 0.95 };

/** [앞말, 뒷말] — 조사를 붙이지 않도록 단어 뒤는 느낌표로 끊는다 */
export const CORRECT_LINES = [
  ['오오오!', '대성공~!'],
  ['대박!', '맞았다!'],
  ['예스!', '천재인데요?'],
];

export const WRONG_LINES = [
  ['어라라?', '아니에요~ 다시 가보자고!'],
  ['어엇!', '아니에요~'],
  ['아쉽다!', '아니에요~'],
];

const PREFERRED_VOICE = /Google|Yuna|Neural|Natural/i;
const lastPickByLines = new Map();

/** 무작위로 고르되 직전에 고른 대사는 피한다 */
function pickLine(lines) {
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === lastPickByLines.get(lines)) i = (i + 1) % lines.length;
  lastPickByLines.set(lines, i);
  return lines[i];
}

/** 목소리 목록은 늦게 채워질 수 있어 매번 다시 찾는다 */
function pickKoreanVoice(synth) {
  const korean = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('ko'));
  return korean.find((v) => PREFERRED_VOICE.test(v.name)) ?? korean[0] ?? null;
}

/** 이전 읽기를 멈추고 조각들을 순서대로 읽는다 */
function speakParts(parts) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const voice = pickKoreanVoice(synth);
  synth.cancel();
  for (const { text, style } of parts) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = style.pitch;
    utterance.rate = style.rate;
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  }
}

/** 글자·단어만 또박또박 */
export function sayWord(text) {
  speakParts([{ text, style: WORD }]);
}

/** 캐릭터 대사 (+ 있으면 또박또박 단어) */
export function sayLine(line, word) {
  const parts = [{ text: line, style: CHARACTER }];
  if (word) parts.push({ text: `${word}!`, style: WORD });
  speakParts(parts);
}

function sayWithLines(lines, word) {
  const [before, after] = pickLine(lines);
  speakParts([
    { text: before, style: CHARACTER },
    { text: `${word}!`, style: WORD },
    { text: after, style: CHARACTER },
  ]);
}

/** 정답: "오오오!" → "호랑이!" → "대성공~!" */
export function sayCorrect(word) {
  sayWithLines(CORRECT_LINES, word);
}

/** 오답: "어라라?" → "사자!" → "아니에요~ 다시 가보자고!" */
export function sayWrong(word) {
  sayWithLines(WRONG_LINES, word);
}
