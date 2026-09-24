/**
 * 한글 게임 공용 단어 풀
 * - 그림(이모지)과 단어가 항상 짝을 이루는 항목만 사용합니다(빈도 사전 + 임의 이모지 해시 없음).
 * - HAND: 교육용으로 검수한 "단어 + 이모지" 문자열에서 파싱.
 * - elementaryPictureExtra.json: 초등 생활·학교 단어 추가(그림과 의미 일치).
 * - 사전에 없는 말은 getEmojiForWord가 null을 돌려줍니다(무작위 그림 없음).
 */

import elementaryExtra from './elementaryPictureExtra.json';

/** 공백 구분 "단어🎨" — 수동 매핑(이모지 품질·교육용 단어 보강) */
const HAND_PAIRS_STRING = `가방🎒 강아지🐶 개구리🐸 거미🕷️ 고양이🐱 곰🐻 축구⚽ 과자🍪 귀👂 귤🍊 기차🚆 나비🦋 눈👀 다람쥐🐿️ 달🌙 닭🐔 돈💵 돼지🐷 라디오📻 마이크🎤 문🚪 물💧 바나나🍌 발🦶 밤🌰 배🍐 뱀🐍 별⭐ 불🔥 비🌧️ 빵🍞 사과🍎 소🐮 손✋ 수박🍉 우산☂️ 자전거🚲 쥐🐭 책📘 코끼리🐘 콩🫘 파인애플🍍 포도🍇 피자🍕 하마🦛 해바라기🌻 호랑이🐯 사자🦁 원숭이🐵 기린🦒 오리🦆 상어🦈 고래🐳 문어🐙 오징어🦑 로켓🚀 비행기✈️ 모자🧢 신발👟 안경👓 시계⌚ 피아노🎹 기타🎸 달팽이🐌 개미🐜 거북이🐢 장미🌹 얼음🧊 무지개🌈 선물🎁 인형🧸 풍선🎈 가위✂️ 연필✏️ 의자🪑 침대🛏️ 휴지🧻 버스🚌 학교🏫 가족👨‍👩‍👧 우유🥛 빨강🔴 파랑🔵 노랑🟡 초록🟢 바다🌊 산⛰️ 나무🌳 새싹🌱 돌🪨 성🏰 다리🌉 지하철🚇 춤💃 병원🏥 약💊 경찰👮 편지✉️ 상자📦 은행🏦 지갑👛 카드💳 열쇠🔑 전화📞 컴퓨터💻 마우스🖱️ 키보드⌨️ 프린터🖨️ 카메라📷 영화🎬 연극🎭 손전등🔦 그림🖼️ 붓🖌️ 물감🎨 크레파스🖍️ 자📏 공책📓 메달🥇 트로피🏆 깃발🚩 지도🗺️ 텐트⛺ 눈사람⛄ 썰매🛷 스키⛷️ 스케이트⛸️ 수영🏊 미끄럼틀🛝 퍼즐🧩 로봇🤖 우주인👨‍🚀 망원경🔭 지구🌍 나침반🧭 보석💎 반지💍 목걸이📿 바지👖 양말🧦 장갑🧤 코트🧥 드레스👗 도시락🍱 주먹밥🍙 라면🍜 고추🌶️ 소금🧂 꿀🍯 버터🧈 치즈🧀 케이크🎂 초콜릿🍫 사탕🍬 아이스크림🍦 빙수🍧 샐러드🥗 샌드위치🥪 햄버거🍔 감자튀김🍟 핫도그🌭 스파게티🍝 카레🍛 죽🥣 찌개🍲 만두🥟 갈비🍖 치킨🍗 조개🐚 굴🦪 새우🦐 게🦀 해파리🪼 산호🪸 독수리🦅 비둘기🕊️ 부엉이🦉 백조🦢 병아리🐤 칠면조🦃 펭귄🐧 우체통📮 백화점🏬 종🔔 해☀️ 목도리🧣 어묵🍢 바구니🧺`;

/** HAND 문자열 → [단어, 이모지][] (중복 포함, 원본 그대로) */
function parseHandPairs() {
  return HAND_PAIRS_STRING.trim()
    .split(/\s+/)
    .map((item) => item.match(/^([가-힣]+)(.*)$/u))
    .filter(Boolean)
    .map((m) => [m[1], m[2] || '✨']);
}

function parseHandMap() {
  const map = {};
  for (const [word, emoji] of parseHandPairs()) map[word] = emoji;
  return map;
}

const HAND_EMOJI_BY_WORD = parseHandMap();

/** JSON에서 온 추가 단어 → 이모지 (HAND와 겹치면 HAND가 우선) */
const EXTRA_EMOJI_BY_WORD = {};
for (const row of elementaryExtra) {
  if (!row || typeof row.word !== 'string' || typeof row.emoji !== 'string') continue;
  if (!/^[가-힣]{1,8}$/u.test(row.word)) continue;
  if (HAND_EMOJI_BY_WORD[row.word]) continue;
  EXTRA_EMOJI_BY_WORD[row.word] = row.emoji;
}

/** 그림·단어 짝을 모은 조회용 맵 (게임1 사전 + 공용) */
const WORD_TO_EMOJI = { ...HAND_EMOJI_BY_WORD, ...EXTRA_EMOJI_BY_WORD };

/**
 * 단어 → 이모지. 사전에 없으면 null (무작위 그림을 만들지 않음)
 */
export function getEmojiForWord(word) {
  if (!word) return null;
  return WORD_TO_EMOJI[word] ?? null;
}

/** HAND 순서 유지 후, JSON 추가 단어를 알파벳(가나다) 순으로 이어 붙임 */
function buildOrderedWordList() {
  const ordered = [];
  const seen = new Set();

  for (const w of Object.keys(HAND_EMOJI_BY_WORD)) {
    if (!/^[가-힣]+$/u.test(w) || seen.has(w)) continue;
    seen.add(w);
    ordered.push(w);
  }

  const extras = Object.keys(EXTRA_EMOJI_BY_WORD).sort((a, b) => a.localeCompare(b, 'ko'));
  for (const w of extras) {
    if (seen.has(w)) continue;
    seen.add(w);
    ordered.push(w);
  }

  return ordered;
}

let bankMemo = null;

/**
 * { word, emoji }[] — 그림과 단어가 항상 맞는 초등·교육용 풀만
 */
export function getKoreanWordBank() {
  if (bankMemo) return bankMemo;
  const list = buildOrderedWordList();
  bankMemo = list.map((word) => ({
    word,
    emoji: WORD_TO_EMOJI[word],
  }));
  return bankMemo;
}

/** 게임1용: 단어 → 이모지 조회 객체 (검수 맵 전체) */
export function getWordEmojiDictionary() {
  return { ...WORD_TO_EMOJI };
}

export function getKoreanWordBankSize() {
  return getKoreanWordBank().length;
}

/** 테스트용: HAND 문자열 + JSON 원본 [단어, 이모지][] (중복 포함) */
export function getRawWordPairsForTest() {
  const fromJson = elementaryExtra
    .filter((row) => row && typeof row.word === 'string')
    .map((row) => [row.word, row.emoji]);
  return [...parseHandPairs(), ...fromJson];
}
