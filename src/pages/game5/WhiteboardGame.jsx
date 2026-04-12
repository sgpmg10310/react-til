import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playHangulWrongJingle } from '../../components/hangul/hangulWrongJingle.js';
import { getKoreanWordBank } from '../../data/hangulMassWordBank.js';
import styles from '../game1/Game.module.css';

const WORD_BANK = getKoreanWordBank();

export default function WhiteboardGame() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guessResult, setGuessResult] = useState(null);

  const playTTS = (text, pitch = 1.3, rate = 1.1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 400;
    canvas.height = 300;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#334155';
    context.lineWidth = 8;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setGuessResult(null);
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

  const handleGuess = () => {
    const canvas = canvasRef.current;
    const ctx2 = canvas?.getContext('2d');
    if (canvas && ctx2) {
      const { data } = ctx2.getImageData(0, 0, canvas.width, canvas.height);
      let painted = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r < 248 || g < 248 || b < 248) painted += 1;
      }
      if (painted < 120) {
        void playHangulWrongJingle();
        playTTS('먼저 글자를 써 주세요!', 1.1, 1.05);
        return;
      }
    }

    setIsAnalyzing(true);
    playTTS('수리수리 마수리... 얍!', 1.5, 1.2);

    setTimeout(() => {
      setIsAnalyzing(false);
      const randomPick = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
      const char = randomPick.word.charAt(0);
      setGuessResult({ char, word: randomPick.word, emoji: randomPick.emoji });
      playTTS(`혹시 ${char} 글자를 쓰셨나요? ${randomPick.word} 네요!`, 1.2, 1.1);
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
        <button type="button" className={styles.resetBtn} onClick={clearCanvas}>🧽 지우기</button>
        <button type="button" className={styles.throwBtn} onClick={handleGuess} disabled={isAnalyzing}>
          {isAnalyzing ? '분석 중... 🤔' : '이게 뭘까? 🪄'}
        </button>
      </div>

      {guessResult && !isAnalyzing && (
        <div className={styles.guessBox}>
          <div className={styles.bigEmojiBox}>{guessResult.emoji}</div>
          <h3 className={styles.guessText}>{guessResult.char} 자로 시작하는 {guessResult.word}!</h3>
        </div>
      )}

      <button type="button" className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}
