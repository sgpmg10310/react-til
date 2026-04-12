/**
 * 한글 게임 공용 단어 풀
 * - 그림(이모지)과 단어가 항상 짝을 이루는 항목만 사용합니다(빈도 사전 + 임의 이모지 해시 없음).
 * - HAND: 교육용으로 검수한 "단어 + 이모지" 문자열에서 파싱.
 * - elementaryPictureExtra.json: 초등 생활·학교 단어 추가(그림과 의미 일치).
 * - 게임1에서 사용자가 만든 임의 조합 글자는 사전에 없을 수 있어, 그때만 getEmojiForWord가 해시 폴백을 씁니다.
 */

import elementaryExtra from './elementaryPictureExtra.json';

const FALLBACK_EMOJIS = [
  '✨', '🌟', '💫', '🎈', '🎉', '🎊', '🎀', '🪄', '🎨', '🧩', '🧸', '🚀', '🌈', '🍀', '🌸',
  '🍭', '🍬', '🍧', '🍰', '🧁', '🎵', '🎶', '🦄', '🐲', '🦕', '🦖', '🐳', '🐬', '🐧', '🐥',
  '🐣', '🌻', '🌼', '🌷', '🍉', '🍓', '🍒', '🍎', '🍑', '🍄', '🌍', '🌞', '🌝', '⭐', '🔥',
  '💧', '⛄', '📚', '✏️', '🎯', '🎪', '🧃', '🎠', '🛼', '🪁', '🎳', '🧿', '🔮', '🎰', '🧩',
];

/** 공백 구분 "단어🎨" — 수동 매핑(이모지 품질·교육용 단어 보강) */
const HAND_PAIRS_STRING = `가방🎒 강아지🐶 개구리🐸 거미🕷️ 고양이🐱 곰🐻 공⚽ 과자🍪 귀👂 귤🍊 기차🚆 나비🦋 눈👀 다람쥐🐿️ 달🌙 닭🐔 돈💵 돼지🐷 라디오📻 마이크🎤 마음💖 무🥕 문🚪 물💧 바나나🍌 발🦶 밤🌰 배🍐 뱀🐍 별⭐ 불🔥 비☔ 빵🍞 사과🍎 새🐦 소🐮 손✋ 수박🍉 우산☔ 자전거🚲 쥐🐭 자동차🚗 책📘 코끼리🐘 콩🫘 파인애플🍍 포도🍇 피자🍕 하마🦛 해바라기🌻 호랑이🐯 사자🦁 원숭이🐵 기린🦒 오리🦆 상어🦈 고래🐳 문어🐙 오징어🦑 로켓🚀 배🚢 비행기✈️ 모자👒 신발👟 안경👓 시계⌚ 피아노🎹 기타🎸 달팽이🐌 개미🐜 거북이🐢 장미🌹 얼음🧊 무지개🌈 선물🎁 인형🧸 풍선🎈 가위✂️ 연필✏️ 의자🪑 침대🛌 휴지🧻 버스🚌 학교🏫 친구🤝 가족👨‍👩‍👧 우유🥛 빨강🔴 파랑🔵 노랑🟡 초록🟢 하늘☁️ 바다🌊 산⛰️ 숲🌲 꽃🌺 나무🌳 잔디🌱 모래🏖️ 돌🪨 모래성🏰 성🏯 다리🌉 터널🚇 지하철🚇 공원🌳 놀이터🛝 미술🖼️ 음악🎼 춤💃 노래🎤 이야기📖 꿈💭 시간⏰ 아침🌅 저녁🌆 밤🌃 병원🏥 약💊 소방서🚒 경찰👮 우체국📮 편지✉️ 우표📮 상자📦 봉투✉️ 가게🏪 시장🏬 은행🏦 돈가방💰 지갑👛 카드💳 열쇠🔑 문패🚪 초인종🔔 벨🔔 전화📞 스마트폰📱 컴퓨터💻 마우스🖱️ 키보드⌨️ 화면🖥️ 프린터🖨️ 카메라📷 사진🖼️ 동영상🎬 영화🎞️ 극장🎭 무대🎪 조명💡 스포트라이트🔦 그림🖼️ 붓🖌️ 물감🎨 크레파스🖍️ 지우개🧽 자📏 컴퍼스🧭 공책📓 연습장📝 숙제📚 시험📝 점수💯 상장🏅 메달🥇 트로피🏆 깃발🚩 나라🗺️ 지도🗺️ 여행✈️ 기념품🎁 캠핑⛺ 텐트⛺ 모닥불🔥 별자리✨ 달빛🌙 햇빛☀️ 구름비🌧️ 눈사람⛄ 눈싸움❄️ 썰매🛷 스키⛷️ 스케이트⛸️ 수영🏊 물놀이💦 미끄럼틀🛝 그네🪢 시소⚖️ 미로🌀 퍼즐🧩 레고🧱 블록🧱 로봇🤖 우주🛸 행성🪐 달탐사🌙 우주인👨‍🚀 별똥별🌠 유성☄️ 망원경🔭 지구본🌍 지도책🗺️ 나침반🧭 보물🏴‍☠️ 암호🔐 금고🏦 다이아💎 보석💠 반지💍 목걸이📿 귀걸이💎 팔찌📿 시계⌚ 모자🧢 셔츠👔 바지👖 양말🧦 신발👞 장화🥾 우산☂️ 장갑🧤 스카프🧣 코트🧥 패딩🧥 후드🧥 청바지👖 반바지🩳 치마👗 드레스👗 한복👘 교복🎓 졸업🎓 입학🎒 책가방🎒 도시락🍱 김밥🍙 라면🍜 국수🍜 떡볶이🍢 순대🍢 튀김🍤 김치🥬 된장🫘 고추장🌶️ 참기름🫙 식초🫙 소금🧂 설탕🍬 꿀🍯 버터🧈 치즈🧀 우유🥛 요거트🍦 아이스🍦 케이크🎂 쿠키🍪 과자🍪 젤리🍬 초콜릿🍫 사탕🍭 막대사탕🍭 아이스크림🍧 빙수🍧 팥빙수🍧 호떡🥞 전🥟 부침개🥘 잡채🥗 샐러드🥗 샌드위치🥪 햄버거🍔 감자튀김🍟 핫도그🌭 피자🍕 스파게티🍝 리조또🍚 카레🍛 덮밥🍚 비빔밥🍚 볶음밥🍚 죽🥣 스프🍲 찌개🍲 전골🍲 샤브샤브🍲 훠궈🍲 마라탕🍲 떡국🍲 만두🥟 완자🥟 교자🥟 스테이크🥩 삼겹살🥓 갈비🍖 닭고기🍗 치킨🍗 튀김닭🍗 양념치킨🍗 간장치킨🍗 생선🐟 연어🐟 참치🐟 고등어🐟 조개🦪 굴🦪 전복🐚 새우🦞 게🦀 대게🦀 꽃게🦀 문어🐙 오징어🦑 낙지🐙 주꾸미🐙 멍게🪸 해파리🪼 산호🪸 조류🐦 독수리🦅 참새🐦 까치🐦 까마귀🐦 비둘기🐦 부엉이🦉 올빼미🦉 제비🐦 두루미🕊️ 학🕊️ 백조🦢 오리🦆 거위🦢 닭🐔 병아리🐤 꿩🐦 꿩고기🍗 칠면조🦃 타조🐦 펭귄🐧 남극🐧 북극곰🐻‍❄️ 북극🧊 빙하🧊 썰매개🐕‍🦺 허스키🐕 리트리버🐕 진돗개🐕 풍산개🐕 말티즈🐩 푸들🐩 비글🐕 닥스훈트🐕 웰시코기🐕 시바견🐕 도베르만🐕 보더콜리🐕 사모예드🐕 골든리트리버🐕 요크셔테리어🐕 치와와🐕 포메라니안🐕 불독🐕 프렌치불독🐕`;

function parseHandMap() {
  const map = {};
  HAND_PAIRS_STRING.trim()
    .split(/\s+/)
    .forEach((item) => {
      const m = item.match(/^([가-힣]+)(.*)$/u);
      if (m) map[m[1]] = m[2] || '✨';
    });
  return map;
}

const HAND_EMOJI_BY_WORD = parseHandMap();

/** JSON에서 온 추가 단어 → 이모지 (HAND와 겹치면 HAND가 우선) */
const EXTRA_EMOJI_BY_WORD = {};
for (const row of elementaryExtra) {
  if (!row || typeof row.word !== 'string' || typeof row.emoji !== 'string') continue;
  if (!/^[가-힣]{2,8}$/u.test(row.word)) continue;
  if (HAND_EMOJI_BY_WORD[row.word]) continue;
  EXTRA_EMOJI_BY_WORD[row.word] = row.emoji;
}

/** 그림·단어 짝을 모은 조회용 맵 (게임1 사전 + 공용) */
const WORD_TO_EMOJI = { ...HAND_EMOJI_BY_WORD, ...EXTRA_EMOJI_BY_WORD };

function hashEmoji(word) {
  let hash = 0;
  for (let i = 0; i < word.length; i += 1) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_EMOJIS[Math.abs(hash) % FALLBACK_EMOJIS.length];
}

/**
 * 단어 → 이모지
 * - 사전에 있는 완성 단어: 검수된 그림과 일치
 * - 없는 조합(게임1 등): 해시로만 장식(그림 퀴즈 정답 풀에는 넣지 않음)
 */
export function getEmojiForWord(word) {
  if (!word) return '✨';
  return WORD_TO_EMOJI[word] ?? hashEmoji(word);
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
