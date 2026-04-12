import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playHangulWrongJingle } from '../../components/hangul/hangulWrongJingle.js';
import { getKoreanWordBankSize } from '../../data/hangulMassWordBank.js';
import styles from '../game1/Game.module.css'; // Reusing styles

export default function WordFromConsonantGame() {
  const navigate = useNavigate();
  const wordCount = getKoreanWordBankSize();
  return (
    <div className={styles.gameContainer}>
      <h2>2. 글자로 단어 만들기 (구현 예정)</h2>
      <p>
        이 게임은 현재 준비 중입니다. 공용 사전에는 <strong>{wordCount.toLocaleString('ko-KR')}개</strong>의 한글
        단어가 들어 있어요.
      </p>
      <p className={styles.wrongSoundHint}>
        틀렸을 때 나는 오답 노래가 궁금하면{' '}
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