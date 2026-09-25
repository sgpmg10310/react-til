import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playHangulWrongJingle } from '../../components/hangul/hangulWrongJingle.js';
import { sayLine, sayWord } from '../../components/hangul/hangulVoice.js';
import { getKoreanWordBank } from '../../data/hangulMassWordBank.js';
import styles from '../game1/Game.module.css'; // Reusing styles

const MASSIVE_DICTIONARY = getKoreanWordBank().map(({ word, emoji }) => ({
  char: word.charAt(0),
  word,
  emoji,
}));

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function LetterToImageGame() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isThrowing, setIsThrowing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState([]);

  // 거대한 사전에서 무작위로 첫 글자가 겹치지 않게 8개의 단어를 뽑아옵니다.
  const refreshWords = () => {
    const shuffled = shuffle(MASSIVE_DICTIONARY);
    const uniqueChars = new Set();
    const selected = [];
    for (const item of shuffled) {
      if (!uniqueChars.has(item.char)) {
        uniqueChars.add(item.char);
        selected.push(item);
        if (selected.length === 8) break; // 항상 8개의 새로운 조합 생성
      }
    }
    setOptions(selected);
    setSelectedItem(null);
    setShowResult(false);
    setIsThrowing(false);
  };

  // 게임에 처음 들어올 때 무작위 단어 목록을 생성합니다.
  useEffect(() => {
    refreshWords();
  }, []);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setIsThrowing(false); // 던지기 상태 초기화
    setShowResult(false); // 결과 숨김
    sayWord(item.char); // 고른 글자 또박또박 읽어주기
  };

  const handleThrow = () => {
    if (!selectedItem || isThrowing) return;
    
    setIsThrowing(true);
    setShowResult(false);
    sayLine('얍!'); // 기합 소리!

    // 1초 동안 공이 날아간 뒤, 관중석에서 결과(그림) 표시
    setTimeout(() => {
      setShowResult(true);
      sayLine('짜잔!', selectedItem.word); // 변신한 단어 읽어주기
    }, 1000);
  };

  return (
    <div className={styles.gameContainer}>
      <h2>4. 글자 던지기 ⚾</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <p className={styles.feedbackText} style={{ margin: 0 }}>글자를 골라 관중석으로 힘껏 던져보세요!</p>
        <button className={styles.refreshWordBtn} onClick={refreshWords}>단어 섞기 🔄</button>
      </div>

      {/* ⚾ 야구장 UI 영역 */}
      <div className={styles.stadium}>
        <div className={styles.standsArea}>
          <span className={styles.standsText}>🏟️ 관중석</span>
        </div>
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
        {options.map((item, idx) => (
          <button 
            key={idx}
            className={selectedItem?.char === item.char ? styles.activeBtn : ''}
            onClick={() => handleSelect(item)}
          >
            {item.char}
          </button>
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
