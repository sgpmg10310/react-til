import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playHangulWrongJingle } from '../../components/hangul/hangulWrongJingle.js';
import {
  getWordEmojiDictionary,
  getKoreanWordBankSize,
} from '../../data/hangulMassWordBank.js';
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

// 검수된 단어→그림 맵 (사전에 있는 단어만 그림 표시)
const WORD_DICTIONARY = getWordEmojiDictionary();
const WORD_BANK_SIZE = getKoreanWordBankSize();

/** 문자열의 모든 글자가 완성형 한글 음절(U+AC00–U+D7A3)인지 검사 (자모 ㄱㅏ 등은 false) */
function isFullyComposedHangul(text) {
  if (!text) return false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c < 0xac00 || c > 0xd7a3) return false;
  }
  return true;
}

function getWordInfo(text) {
  if (!text) return null;
  // 미완성(자음/모음만 있거나 조합 실패로 자모가 섞인 경우)이면 이모지 없음 — 사전 조회보다 먼저 검사
  if (!isFullyComposedHangul(text)) return null;
  // 사전에 있는 단어일 때만 그림을 보여 준다(무작위 그림 없음)
  const emoji = WORD_DICTIONARY[text];
  return emoji ? { word: text, emoji } : null;
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
      <p className={styles.bankHint}>
        연동 사전: 약 <strong>{WORD_BANK_SIZE.toLocaleString('ko-KR')}</strong>개 단어 (사전에 있는 단어를 만들면
        그림이 나와요)
      </p>
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
      <p className={styles.wrongSoundHint}>
        다른 게임에서 틀렸을 때 나는 노래가 궁금하면{' '}
        <button
          type="button"
          className={styles.wrongSoundBtn}
          onClick={() => {
            void playHangulWrongJingle();
          }}
        >
          오답 노래 듣기
        </button>
      </p>
      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}