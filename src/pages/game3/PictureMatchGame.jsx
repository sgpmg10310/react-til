import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playHangulWrongJingle } from '../../components/hangul/hangulWrongJingle.js';
import { getKoreanWordBank } from '../../data/hangulMassWordBank.js';
import styles from '../game1/Game.module.css'; // Reusing styles

const DICTIONARY = getKoreanWordBank();

// 배열을 무작위로 섞어주는 함수
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function PictureMatchGame() {
  const navigate = useNavigate();
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('그림에 맞는 단어를 찾아보세요!');
  const [isWrong, setIsWrong] = useState(false);

  // 새로운 문제를 출제하는 함수
  const nextTurn = () => {
    const shuffled = shuffle(DICTIONARY);
    const answer = shuffled[0];
    const wrongs = shuffled.slice(1, 4); // 오답 보기 3개 추출 (총 4개 보기)
    
    setTarget(answer);
    setOptions(shuffle([answer, ...wrongs])); // 정답과 오답을 섞어서 배치
    setFeedback('그림에 맞는 단어를 찾아보세요!');
    setIsWrong(false);
  };

  useEffect(() => {
    nextTurn();
  }, []);

  // 🎵 TTS 소리 재생 함수 (pitch로 목소리 높낮이를 조절해 웃기게 만듦)
  const playTTS = (text, pitch = 1.0, rate = 1.0) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  const handleGuess = (word) => {
    if (!target) return;

    if (word === target.word) {
      setFeedback('🎉 정답입니다! 참 잘했어요!');
      playTTS(`${word}! 딩동댕동!`, 1.5, 1.1); // 정답일 땐 높고 경쾌한 목소리
      setTimeout(nextTurn, 2000); // 2초 뒤 다음 문제로
    } else {
      setFeedback('🤔 앗! 다시 생각해보세요~');
      setIsWrong(true);
      void playHangulWrongJingle();
      setTimeout(() => setIsWrong(false), 600); // 흔들림 애니메이션 해제
    }
  };

  if (!target) return null;

  return (
    <div className={styles.gameContainer}>
      <h2>3. 그림 카드 맞추기</h2>
      <p className={styles.feedbackText}>{feedback}</p>
      
      {/* 오답일 때 shake 클래스가 붙어 화면이 흔들립니다 */}
      <div className={`${styles.resultArea} ${isWrong ? styles.shake : ''}`}>
        <div className={styles.bigEmojiBox}>{target.emoji}</div>
      </div>

      <div className={styles.buttonGrid}>
        {options.map((opt, idx) => (
          <button 
            key={idx} 
            className={styles.wordOptionBtn}
            onClick={() => handleGuess(opt.word)}
          >
            {opt.word}
          </button>
        ))}
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}
