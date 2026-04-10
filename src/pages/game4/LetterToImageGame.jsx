import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../game1/Game.module.css'; // Reusing styles

// 1000개 이상의 무한한 플레이 조합을 만들기 위한 방대한 기초 데이터 (약 120종)
const RAW_WORDS = [
  "사과🍎", "바나나🍌", "포도🍇", "딸기🍓", "수박🍉", "귤🍊", "레몬🍋", "복숭아🍑", "파인애플🍍", "체리🍒",
  "호랑이🐯", "사자🦁", "강아지🐶", "고양이🐱", "돼지🐷", "하마🦛", "기린🦒", "원숭이🐵", "코끼리🐘", "곰🐻",
  "토끼🐰", "쥐🐭", "소🐮", "말🐴", "양🐑", "닭🐔", "오리🦆", "새🐦", "독수리🦅", "부엉이🦉",
  "개구리🐸", "거북이🐢", "뱀🐍", "악어🐊", "물고기🐟", "상어🦈", "고래🐳", "돌고래🐬", "문어🐙", "오징어🦑",
  "게🦀", "새우🦐", "나비🦋", "벌🐝", "개미🐜", "거미🕷️", "달팽이🐌", "무당벌레🐞", "모기🦟", "파리🪰",
  "기차🚆", "자동차🚗", "택시🚕", "경찰차🚓", "소방차🚒", "구급차🚑", "버스🚌", "트럭🚚", "자전거🚲", "오토바이🏍️",
  "비행기✈️", "헬리콥터🚁", "로켓🚀", "우주선🛸", "배🚢", "보트⛵", "우산☔", "시계⌚", "안경👓", "모자👒",
  "가방🎒", "신발👟", "구두👞", "양말🧦", "바지👖", "치마👗", "티셔츠👕", "장갑🧤", "목도리🧣", "반지💍",
  "책📖", "연필✏️", "가위✂️", "피아노🎹", "기타🎸", "나팔🎺", "드럼🥁", "바이올린🎻", "해바라기🌻", "장미🌹",
  "달🌙", "별⭐", "해☀️", "구름☁️", "눈❄️", "비🌧️", "불🔥", "물💧", "얼음🧊", "무지개🌈",
  "공⚽", "농구🏀", "야구⚾", "테니스🎾", "배구🏐", "탁구🏓", "골프⛳", "메달🏅", "트로피🏆", "왕관👑",
  "선물🎁", "풍선🎈", "인형🧸", "휴지통🗑️", "자물쇠🔒", "열쇠🔑", "망치🔨", "도끼🪓", "전구💡", "휴지🧻"
];

// 단어와 이모지를 자동으로 분리하여 게임 사전을 만듭니다.
const MASSIVE_DICTIONARY = RAW_WORDS.map(str => {
  const wordMatch = str.match(/^[가-힣]+/);
  const word = wordMatch ? wordMatch[0] : '';
  const emoji = str.replace(word, '').trim() || '✨';
  return { char: word.charAt(0), word, emoji };
}).filter(item => item.word);

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

      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}
