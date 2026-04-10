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

// 실제 단어 매핑 (이모지 및 단어 표시용)
const WORD_DICTIONARY = {
  '가': { word: '가방', emoji: '🎒' },
  '강': { word: '강아지', emoji: '🐶' },
  '개': { word: '개구리', emoji: '🐸' },
  '거': { word: '거미', emoji: '🕷️' },
  '고': { word: '고양이', emoji: '🐱' },
  '곰': { word: '곰', emoji: '🐻' },
  '공': { word: '공', emoji: '⚽' },
  '과': { word: '과자', emoji: '🍪' },
  '귀': { word: '귀', emoji: '👂' },
  '귤': { word: '귤', emoji: '🍊' },
  '기': { word: '기차', emoji: '🚆' },
  '나': { word: '나비', emoji: '🦋' },
  '눈': { word: '눈', emoji: '👀' },
  '다': { word: '다람쥐', emoji: '🐿️' },
  '달': { word: '달', emoji: '🌙' },
  '닭': { word: '닭', emoji: '🐔' },
  '돈': { word: '돈', emoji: '💵' },
  '돼': { word: '돼지', emoji: '🐷' },
  '라': { word: '라디오', emoji: '📻' },
  '마': { word: '마이크', emoji: '🎤' },
  '맘': { word: '마음', emoji: '💖' },
  '무': { word: '무', emoji: '🥕' },
  '문': { word: '문', emoji: '🚪' },
  '물': { word: '물', emoji: '💧' },
  '뮈': { word: '다람쥐 (뮈?)', emoji: '🐿️' }, // 요청하신 '뮈'
  '바': { word: '바나나', emoji: '🍌' },
  '발': { word: '발', emoji: '🦶' },
  '밤': { word: '밤', emoji: '🌰' },
  '배': { word: '배', emoji: '🍐' },
  '뱀': { word: '뱀', emoji: '🐍' },
  '별': { word: '별', emoji: '⭐' },
  '불': { word: '불', emoji: '🔥' },
  '비': { word: '비', emoji: '☔' },
  '빵': { word: '빵', emoji: '🍞' },
  '사': { word: '사과', emoji: '🍎' },
  '새': { word: '새', emoji: '🐦' },
  '소': { word: '소', emoji: '🐮' },
  '손': { word: '손', emoji: '✋' },
  '수': { word: '수박', emoji: '🍉' },
  '우': { word: '우산', emoji: '☔' },
  '자': { word: '자전거', emoji: '🚲' },
  '쥐': { word: '쥐', emoji: '🐭' },
  '차': { word: '자동차', emoji: '🚗' },
  '책': { word: '책', emoji: '📘' },
  '코': { word: '코끼리', emoji: '🐘' },
  '콩': { word: '콩', emoji: '🫘' },
  '파': { word: '파인애플', emoji: '🍍' },
  '포': { word: '포도', emoji: '🍇' },
  '피': { word: '피자', emoji: '🍕' },
  '하': { word: '하마', emoji: '🦛' },
  '해': { word: '해바라기', emoji: '🌻' }
};

export default function CombineSoundsGame() {
  const navigate = useNavigate();
  
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

    let nextCho = cho;
    let nextJung = jung;
    let nextJong = jong;

    if (type === 'consonant') {
      if (!cho) { nextCho = value; }
      else if (cho && !jung) { nextCho = value; } // 초성 교체
      else if (cho && jung) { nextJong = value; } // 종성(받침) 추가 또는 교체
    } else {
      if (!cho) { nextCho = 'ㅇ'; nextJung = value; } // 모음 먼저 누르면 'ㅇ' 자동 추가
      else if (cho && !jung) { nextJung = value; }
      else if (cho && jung && !jong) {
        // 모음 결합 처리 (예: ㅜ + ㅣ = ㅟ)
        const combo = VOWEL_COMBOS[jung + value];
        if (combo) { nextJung = combo; }
        else { nextJung = value; } // 결합 불가 시 교체
      } else if (cho && jung && jong) {
        nextJung = value; // 종성이 있는데 모음 누르면 새로운 중성으로 취급, 종성 삭제
        nextJong = '';
      }
    }

    setCho(nextCho);
    setJung(nextJung);
    setJong(nextJong);

    const nextCombined = getCombined(nextCho, nextJung, nextJong);
    if (nextCombined && (nextCho !== cho || nextJung !== jung || nextJong !== jong) && nextJung) {
      setTimeout(() => {
        const playText = WORD_DICTIONARY[nextCombined] ? WORD_DICTIONARY[nextCombined].word : nextCombined;
        playSound(playText); // 완성된 글자나 단어를 읽어줍니다.
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

  const reset = () => { setCho(''); setJung(''); setJong(''); };

  const combined = getCombined(cho, jung, jong);
  const wordInfo = WORD_DICTIONARY[combined];

  return (
    <div className={styles.gameContainer}>
      <h2>1. 자음 + 모음 합치기</h2>
      <div className={styles.selectionArea}>
        <p>초성: <strong>{cho || '?'}</strong> | 중성: <strong>{jung || '?'}</strong> | 종성: <strong>{jong || '없음'}</strong></p>
        <button className={styles.resetBtn} onClick={reset}>지우고 다시하기 ↺</button>
      </div>
      
      <div className={styles.resultArea}>
        {combined ? (
          <div className={styles.bouncyResult} key={combined}>
            <h3 className={styles.resultText}>{combined}</h3>
            {wordInfo ? (
              <>
                <div className={styles.emojiBox}>{wordInfo.emoji}</div>
                <div className={styles.wordText}>{wordInfo.word}</div>
              </>
            ) : (
              <p className={styles.placeholderText}>이 글자가 들어가는 단어를 생각해보세요!</p>
            )}
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