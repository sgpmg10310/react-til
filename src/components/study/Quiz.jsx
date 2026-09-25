import { useState } from 'react';
import styles from './StudyLab.module.css';

/**
 * 고르면 바로 정답/해설을 보여주는 퀴즈.
 * @param {{ questions: { q: string, code?: string, options: string[], answer: number, why: string }[] }} props
 */
export default function Quiz({ questions }) {
  const [picked, setPicked] = useState({});
  const score = questions.filter((item, i) => picked[i] === item.answer).length;
  const done = Object.keys(picked).length;

  return (
    <div className={styles.quiz}>
      <p className={styles.quizScore}>
        맞힌 문제 {score} / {questions.length}
        {done === questions.length && (score === questions.length ? ' 🎉 전부 정답!' : ' — 틀린 문제의 해설을 읽어 보세요')}
      </p>
      {questions.map((item, i) => {
        const chosen = picked[i];
        return (
          <div key={item.q} className={styles.quizItem}>
            <p className={styles.quizQ}>Q{i + 1}. {item.q}</p>
            {item.code && <pre className={styles.miniCode}><code>{item.code}</code></pre>}
            <div className={styles.quizOptions}>
              {item.options.map((option, j) => {
                let state = '';
                if (chosen !== undefined && j === item.answer) state = styles.optionRight;
                else if (chosen === j) state = styles.optionWrong;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.option} ${state}`}
                    disabled={chosen !== undefined}
                    onClick={() => setPicked((prev) => ({ ...prev, [i]: j }))}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {chosen !== undefined && (
              <p className={styles.quizWhy}>
                {chosen === item.answer ? '⭕ 정답! ' : '❌ 아쉬워요. '}
                {item.why}
              </p>
            )}
          </div>
        );
      })}
      <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPicked({})}>
        ↺ 다시 풀기
      </button>
    </div>
  );
}
