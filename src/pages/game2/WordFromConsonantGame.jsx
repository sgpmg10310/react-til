import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../game1/Game.module.css'; // Reusing styles

export default function WordFromConsonantGame() {
  const navigate = useNavigate();
  return (
    <div className={styles.gameContainer}>
      <h2>2. 글자로 단어 만들기 (구현 예정)</h2>
      <p>이 게임은 현재 준비 중입니다.</p>
      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}