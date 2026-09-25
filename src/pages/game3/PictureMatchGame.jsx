import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playWrongJingleThenSay } from '../../components/hangul/hangulWrongJingle.js';
import { sayCorrect } from '../../components/hangul/hangulVoice.js';
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
  // 정답 후 다음 문제가 나올 때까지 버튼 잠금 (연타로 두 번 넘어가는 것 방지)
  const [locked, setLocked] = useState(false);
  const cancelSayRef = useRef(() => {});
  const nextTimerRef = useRef(0);

  // 새로운 문제를 출제하는 함수
  const nextTurn = () => {
    const shuffled = shuffle(DICTIONARY);
    const answer = shuffled[0];
    const wrongs = shuffled.slice(1, 4); // 오답 보기 3개 추출 (총 4개 보기)
    
    setTarget(answer);
    setOptions(shuffle([answer, ...wrongs])); // 정답과 오답을 섞어서 배치
    setFeedback('그림에 맞는 단어를 찾아보세요!');
    setIsWrong(false);
    setLocked(false);
  };

  useEffect(() => {
    nextTurn();
    // 화면을 나가면 예약된 다음 문제와 오답 읽기를 정리
    return () => {
      cancelSayRef.current();
      window.clearTimeout(nextTimerRef.current);
    };
  }, []);

  const handleGuess = (word) => {
    if (!target || locked) return;
    // 앞에서 틀린 단어를 아직 읽기 전이면 취소 (목소리 겹침 방지)
    cancelSayRef.current();

    if (word === target.word) {
      setLocked(true);
      setFeedback('🎉 정답입니다! 참 잘했어요!');
      sayCorrect(word); // 캐릭터 정답 대사 (예: 오오오! 호랑이! 대성공~!)
      nextTimerRef.current = window.setTimeout(nextTurn, 2000); // 2초 뒤 다음 문제로
    } else {
      setFeedback('🤔 앗! 다시 생각해보세요~');
      setIsWrong(true);
      cancelSayRef.current = playWrongJingleThenSay(word); // 오답 소리 뒤 고른 단어 읽기
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
            disabled={locked}
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
