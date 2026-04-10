import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HangulGameView.module.css';

export default function HangulGameView() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎵 웃는 캐릭터와 함께하는 한글 놀이 🎵</h1>
        <p>재미있는 게임으로 한글을 배워봐요!</p>
      </header>
      <div className={styles.gameMenu}>
        <div className={styles.gameCard} onClick={() => navigate('/hangul-game/game1')}>
          <h2>1. 자음 + 모음 합치기</h2>
          <p>자음과 모음을 눌러 글자를 만들고 소리를 들어보세요!</p>
        </div>
        <div className={styles.gameCard} onClick={() => navigate('/hangul-game/game2')}>
          <h2>2. 글자로 단어 만들기</h2>
          <p>'ㄱ', 'ㄴ', 'ㄷ' 버튼을 눌러 쉬운 단어를 배워봐요.</p>
        </div>
        <div className={styles.gameCard} onClick={() => navigate('/hangul-game/game3')}>
          <h2>3. 그림 카드 맞추기</h2>
          <p>그림에 맞는 단어 카드를 찾아보세요.</p>
        </div>
        <div className={styles.gameCard} onClick={() => navigate('/hangul-game/game4')}>
          <h2>4. 글자 던지기</h2>
          <p>글자를 던지면 어떤 그림이 나올까요?</p>
        </div>
        <div className={styles.gameCard} onClick={() => navigate('/hangul-game/game5')}>
          <h2>5. 마법의 화이트보드 🪄</h2>
          <p>글자를 쓰면 마법사가 어떤 글자인지 맞춰요!</p>
        </div>
      </div>
      <button className={styles.backBtn} onClick={() => navigate('/')}>🏠 홈으로 가기</button>
    </div>
  );
}