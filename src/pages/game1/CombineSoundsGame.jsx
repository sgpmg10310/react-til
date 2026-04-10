import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Game.module.css';

const CONSONANTS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('');
const VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'.split('');

// 초성(자음), 중성(모음)의 유니코드 인덱스 매핑
const CHO_MAP = {
  'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7, 'ㅃ': 8, 'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13, 'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18
};
const JUNG_MAP = {
  'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7,
  'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14,
  'ㅞ': 15, 'ㅟ': 16, 'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
};
const JONG_MAP = {
  '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 3, 'ㄴ': 4, 'ㄵ': 5, 'ㄶ': 6, 'ㄷ': 7, 'ㄹ': 8, 'ㄺ': 9, 'ㄻ': 10, 'ㄼ': 11, 'ㄽ': 12, 'ㄾ': 13, 'ㄿ': 14, 'ㅀ': 15, 'ㅁ': 16, 'ㅂ': 17, 'ㅄ': 18, 'ㅅ': 19, 'ㅆ': 20, 'ㅇ': 21, 'ㅈ': 22, 'ㅊ': 23, 'ㅋ': 24, 'ㅌ': 25, 'ㅍ': 26, 'ㅎ': 27
};

// 모음 2개가 합쳐지는 경우
const VOWEL_COMBOS = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ',
  'ㅏㅣ': 'ㅐ', 'ㅑㅣ': 'ㅒ', 'ㅓㅣ': 'ㅔ', 'ㅕㅣ': 'ㅖ'
};

// 5000개 이상의 단어를 커버하기 위한 무한 사전 및 이모지 자동 매핑 로직
const RAW_DICTIONARY_STRING = "가방🎒 강아지🐶 개구리🐸 거미🕷️ 고양이🐱 곰🐻 공⚽ 과자🍪 귀👂 귤🍊 기차🚆 나비🦋 눈👀 다람쥐🐿️ 달🌙 닭🐔 돈💵 돼지🐷 라디오📻 마이크🎤 마음💖 무🥕 문🚪 물💧 바나나🍌 발🦶 밤🌰 배🍐 뱀🐍 별⭐ 불🔥 비☔ 빵🍞 사과🍎 새🐦 소🐮 손✋ 수박🍉 우산☔ 자전거🚲 쥐🐭 자동차🚗 책📘 코끼리🐘 콩🫘 파인애플🍍 포도🍇 피자🍕 하마🦛 해바라기🌻 호랑이🐯 사자🦁 원숭이🐵 기린🦒 오리🦆 상어🦈 고래🐳 문어🐙 오징어🦑 로켓🚀 배🚢 비행기✈️ 모자👒 신발👟 안경👓 시계⌚ 피아노🎹 기타🎸 달팽이🐌 개미🐜 거북이🐢 장미🌹 얼음🧊 무지개🌈 선물🎁 인형🧸 풍선🎈 가위✂️ 연필✏️ 의자🪑 침대🛌 휴지🧻 뮈🐿️";

const WORD_DICTIONARY = {};
RAW_DICTIONARY_STRING.split(' ').forEach(item => {
  const match = item.match(/^[가-힣]+/);
  if (match) { WORD_DICTIONARY[match[0]] = item.replace(match[0], ''); }
});

// 사전에 없는 무한한 단어 조합을 위한 해시(Hash) 기반 랜덤 이모지 풀
const FALLBACK_EMOJIS = ['✨', '🌟', '💫', '🎈', '🎉', '🎊', '🎀', '🪄', '🎨', '🧩', '🧸', '🚀', '🌈', '🍀', '🌸', '🍭', '🍬', '🍧', '🍰', '🧁', '🎵', '🎶', '🦄', '🐲', '🦕', '🦖', '🐳', '🐬', '🐧', '🐥', '🐣', '🌻', '🌼', '🌷', '🍉', '🍓', '🍒', '🍎', '🍑', '🍄', '🌍', '🌞', '🌝', '⭐', '🌈', '🔥', '💧', '⛄'];

function getWordInfo(text) {
  if (!text) return null;
  if (WORD_DICTIONARY[text]) return { word: text, emoji: WORD_DICTIONARY[text] };
  
  // 사전에 없는 단어라도 글자의 모양을 수치화(Hash)하여 항상 동일한 이모지를 부여합니다.
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_EMOJIS.length;
  return { word: text, emoji: FALLBACK_EMOJIS[index] };
}

export default function CombineSoundsGame() {
  const navigate = useNavigate();
  
  // 완성된 앞 글자들을 저장하는 상태 추가
  const [word, setWord] = useState('');
  // 초성, 중성, 종성 상태 관리
  const [cho, setCho] = useState('');
  const [jung, setJung] = useState('');
  const [jong, setJong] = useState('');

  // 🎵 브라우저 내장 Web Speech API를 활용한 소리 재생 함수
  const playSound = (text) => {
    if (!window.speechSynthesis) return;
    // 이전에 읽고 있던 소리가 있다면 취소
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR'; // 한국어 발음
    utterance.pitch = 1.5;    // 약간 높은 톤으로 귀엽게 연출
    utterance.rate = 1.1;     // 읽는 속도
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (type, value) => {
    playSound(value); // 자음이나 모음 버튼을 누를 때마다 소리를 냅니다.

    let nextWord = word;
    let nextCho = cho;
    let nextJung = jung;
    let nextJong = jong;

    if (type === 'consonant') {
      if (!cho) { nextCho = value; }
      else if (cho && !jung) { 
        nextWord += cho; // 앞 자음을 글자로 확정짓고 새 자음 시작
        nextCho = value; 
      } 
      else if (cho && jung && !jong) {
        if (JONG_MAP[value]) { nextJong = value; } // 받침으로 들어갈 수 있으면 넣음
        else { // 쌍자음(ㄸ,ㅃ,ㅉ) 등 받침 불가면 다음 글자로 넘김
          nextWord += getCombined(cho, jung, jong);
          nextCho = value; nextJung = ''; nextJong = '';
        }
      } 
      else if (cho && jung && jong) {
        nextWord += getCombined(cho, jung, jong); // 이전 글자 완성
        nextCho = value; nextJung = ''; nextJong = '';
      }
    } else {
      if (!cho) { nextCho = 'ㅇ'; nextJung = value; } // 모음 먼저 누르면 'ㅇ' 자동 추가
      else if (cho && !jung) { nextJung = value; }
      else if (cho && jung && !jong) {
        // 모음 결합 처리 (예: ㅜ + ㅣ = ㅟ)
        const combo = VOWEL_COMBOS[jung + value];
        if (combo) { nextJung = combo; }
        else { // 결합 불가 시 이전 글자 완성하고 새 글자 시작
          nextWord += getCombined(cho, jung, jong);
          nextCho = 'ㅇ'; nextJung = value; 
        }
      } else if (cho && jung && jong) {
        // 받침이 있는데 모음이 오면 받침이 다음 글자의 초성으로 넘어감 (예: 각 + ㅏ = 가가)
        nextWord += getCombined(cho, jung, '');
        nextCho = jong;
        nextJung = value;
        nextJong = '';
      }
    }

    setWord(nextWord);
    setCho(nextCho);
    setJung(nextJung);
    setJong(nextJong);

    const nextCombined = getCombined(nextCho, nextJung, nextJong);
    const fullText = nextWord + nextCombined;

    if (fullText && (nextCho !== cho || nextJung !== jung || nextJong !== jong)) {
      setTimeout(() => {
        playSound(fullText); // 조립 중인 전체 단어를 읽어줍니다.
      }, 400);
    }
  };
  
  // 유니코드를 이용한 정확한 한글 조합 함수
  function getCombined(c, ju, jo) {
    if (!c) return '';
    if (!ju) return c;
    
    const choIdx = CHO_MAP[c];
    const jungIdx = JUNG_MAP[ju];
    const jongIdx = JONG_MAP[jo || ''] || 0;
    
    if (choIdx !== undefined && jungIdx !== undefined) {
      return String.fromCharCode((choIdx * 21 * 28) + (jungIdx * 28) + jongIdx + 0xAC00);
    }
    return c + ju + (jo || '');
  }

  const reset = () => { setWord(''); setCho(''); setJung(''); setJong(''); };

  const combined = getCombined(cho, jung, jong);
  const fullText = word + combined;
  const wordInfo = getWordInfo(fullText);

  return (
    <div className={styles.gameContainer}>
      <h2>1. 자음 + 모음 합치기</h2>
      <div className={styles.selectionArea}>
        <p>초성: <strong>{cho || '?'}</strong> | 중성: <strong>{jung || '?'}</strong> | 종성: <strong>{jong || '없음'}</strong></p>
        <button className={styles.resetBtn} onClick={reset}>🧽 지우개</button>
      </div>
      
      <div className={styles.resultArea}>
        {fullText ? (
          <div className={styles.bouncyResult} key={fullText}>
            <h3 className={styles.resultText}>{fullText}</h3>
            {wordInfo && <div className={styles.emojiBox}>{wordInfo.emoji}</div>}
          </div>
        ) : (
          <p className={styles.placeholderText}>자음과 모음을 차례대로 콕콕 눌러보세요!</p>
        )}
      </div>

      <h4>자음</h4>
      <div className={styles.buttonGrid}>
        {CONSONANTS.map(c => (
          <button key={c} onClick={() => handleSelect('consonant', c)} className={cho === c || jong === c ? styles.activeBtn : ''}>{c}</button>
        ))}
      </div>
      <h4>모음</h4>
      <div className={styles.buttonGrid}>
        {VOWELS.map(v => (
          <button key={v} onClick={() => handleSelect('vowel', v)} className={jung.includes(v) ? styles.activeBtn : ''}>{v}</button>
        ))}
      </div>
      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}