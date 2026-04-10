import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../game1/Game.module.css'; // Reusing styles

// 던질 글자와 변환될 사물/동물 사전
const DICTIONARY = [
  { char: '사', word: '사과', emoji: '🍎' },
  { char: '호', word: '호랑이', emoji: '🐯' },
  { char: '포', word: '포도', emoji: '🍇' },
  { char: '나', word: '나비', emoji: '🦋' },
  { char: '돼', word: '돼지', emoji: '🐷' },
  { char: '하', word: '하마', emoji: '🦛' },
  { char: '기', word: '기차', emoji: '🚆' },
  { char: '우', word: '우산', emoji: '☔' }
];

export default function LetterToImageGame() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isThrowing, setIsThrowing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 🎵 브라우저 내장 TTS (목소리 재생)
  const playTTS = (text, pitch = 1.2, rate = 1.1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setIsThrowing(false); // 던지기 상태 초기화
    setShowResult(false); // 결과 숨김
    playTTS(item.char); // 고른 글자 읽어주기
  };

  const handleThrow = () => {
    if (!selectedItem || isThrowing) return;
    
    setIsThrowing(true);
    setShowResult(false);
    playTTS("얍!", 1.5, 1.5); // 기합 소리!

    // 1초 동안 공이 날아간 뒤, 관중석에서 결과(그림) 표시
    setTimeout(() => {
      setShowResult(true);
      playTTS(`${selectedItem.word}!`, 1.2, 1.0); // 변신한 단어 읽어주기
    }, 1000);
  };

  return (
    <div className={styles.gameContainer}>
      <h2>4. 글자 던지기 ⚾</h2>
      <p className={styles.feedbackText}>글자를 골라 관중석으로 힘껏 던져보세요!</p>

      {/* ⚾ 야구장 UI 영역 */}
      <div className={styles.stadium}>
        <div className={styles.stands}>🏟️ 관중석</div>
        <div className={styles.pitcher}>🧑‍⚾ 투수</div>

        {/* 선택한 글자가 적힌 야구공 */}
        {selectedItem && !showResult && (
          <div className={`${styles.baseball} ${isThrowing ? styles.thrown : ''}`}>
            ⚾
            <span className={styles.baseballText}>{selectedItem.char}</span>
          </div>
        )}

        {/* 관중석에 도착해서 그림으로 변신한 결과 */}
        {showResult && selectedItem && (
          <div className={styles.stadiumResult}>
            <div className={styles.stadiumEmoji}>{selectedItem.emoji}</div>
            <div className={styles.stadiumWord}>{selectedItem.word}</div>
          </div>
        )}
      </div>

      {/* 조작 버튼 영역 */}
      <div style={{ margin: '20px 0' }}>
        <button 
          className={styles.throwBtn} 
          onClick={handleThrow}
          disabled={!selectedItem || isThrowing}
        >
          던지기! 🚀
        </button>
      </div>

      <h4>던질 글자 선택</h4>
      <div className={styles.buttonGrid}>
        {DICTIONARY.map((item, idx) => (
          <button 
            key={idx}
            className={selectedItem?.char === item.char ? styles.activeBtn : ''}
            onClick={() => handleSelect(item)}
          >
            {item.char}
          </button>
        ))}
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}
