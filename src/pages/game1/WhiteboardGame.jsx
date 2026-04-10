import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../game1/Game.module.css'; // 공통 스타일 재사용

// 마법사가 맞출 단어 사전 (게임 4와 비슷한 맥락)
const MAGIC_WORDS = [
  { char: '가', word: '가방', emoji: '🎒' }, { char: '나', word: '나비', emoji: '🦋' },
  { char: '다', word: '다람쥐', emoji: '🐿️' }, { char: '라', word: '라디오', emoji: '📻' },
  { char: '마', word: '마이크', emoji: '🎤' }, { char: '바', word: '바나나', emoji: '🍌' },
  { char: '사', word: '사과', emoji: '🍎' }, { char: '아', word: '아이스크림', emoji: '🍧' },
  { char: '자', word: '자전거', emoji: '🚲' }, { char: '차', word: '자동차', emoji: '🚗' },
  { char: '카', word: '카메라', emoji: '📷' }, { char: '타', word: '타조', emoji: '🐦' },
  { char: '파', word: '파인애플', emoji: '🍍' }, { char: '하', word: '하마', emoji: '🦛' }
];

export default function WhiteboardGame() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guessResult, setGuessResult] = useState(null);

  // 🎵 브라우저 내장 TTS 기능
  const playTTS = (text, pitch = 1.3, rate = 1.1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  // 캔버스 초기화 세팅
  useEffect(() => {
    const canvas = canvasRef.current;
    // 레티나 디스플레이 등 해상도를 위해 2배로 키우고 CSS로 줄이는 기법 가능하지만, 여기선 기본으로 구현
    canvas.width = 400;
    canvas.height = 300;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#334155'; // 펜 색상
    context.lineWidth = 8; // 펜 굵기
    contextRef.current = context;
  }, []);

  // 그리기 이벤트 핸들러 (마우스 + 터치 통합)
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setGuessResult(null); // 새로 그리기 시작하면 정답창 숨기기
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setGuessResult(null);
  };

  // 마법의 분석 (시뮬레이션)
  const handleGuess = () => {
    setIsAnalyzing(true);
    playTTS("수리수리 마수리... 얍!", 1.5, 1.2);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      // 무작위로 하나의 단어를 뽑아서 완성해 줍니다.
      const randomPick = MAGIC_WORDS[Math.floor(Math.random() * MAGIC_WORDS.length)];
      setGuessResult(randomPick);
      playTTS(`혹시 ${randomPick.char} 글자를 쓰셨나요? ${randomPick.word} 네요!`, 1.2, 1.1);
    }, 1500);
  };

  return (
    <div className={styles.gameContainer}>
      <h2>5. 마법의 화이트보드 🪄</h2>
      <p className={styles.feedbackText}>보드에 글자를 쓰고 마법사에게 물어보세요!</p>

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerOut={stopDrawing}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
        <button className={styles.resetBtn} onClick={clearCanvas}>🧽 지우기</button>
        <button className={styles.throwBtn} onClick={handleGuess} disabled={isAnalyzing}>
          {isAnalyzing ? '분석 중... 🤔' : '이게 뭘까? 🪄'}
        </button>
      </div>

      {guessResult && !isAnalyzing && (
        <div className={styles.guessBox}>
          <div className={styles.bigEmojiBox}>{guessResult.emoji}</div>
          <h3 className={styles.guessText}>{guessResult.char} 자로 시작하는 {guessResult.word}!</h3>
        </div>
      )}

      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}