import { useState } from 'react';
import { runCode } from './runCode.js';
import styles from './StudyLab.module.css';

/**
 * 코드를 고쳐서 바로 실행해 보는 연습장.
 * @param {{ title: string, initialCode: string, scope?: Record<string, unknown>, hint?: string }} props
 */
export default function PracticeBox({ title, initialCode, scope, hint }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState(null);

  const run = () => setResult(runCode(code, scope));
  const reset = () => {
    setCode(initialCode);
    setResult(null);
  };

  return (
    <div className={styles.practice}>
      <div className={styles.practiceHead}>
        <strong>✍️ {title}</strong>
        <span className={styles.muted}>Ctrl/⌘ + Enter로 실행</span>
      </div>
      {hint && <p className={styles.hint}>💡 {hint}</p>}
      <textarea
        className={styles.editor}
        value={code}
        spellCheck={false}
        rows={Math.min(22, code.split('\n').length + 1)}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            run();
          }
        }}
        aria-label={`${title} 코드 편집기`}
      />
      <div className={styles.row}>
        <button type="button" className={styles.btn} onClick={run}>▶ 실행</button>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>↺ 처음으로</button>
      </div>
      {result && (
        <pre className={styles.output} aria-live="polite">
          {result.logs.length === 0 && !result.error && '(출력 없음 — console.log()로 값을 찍어 보세요)'}
          {result.logs.join('\n')}
          {result.error && `${result.logs.length ? '\n' : ''}❌ 에러: ${result.error}`}
        </pre>
      )}
    </div>
  );
}
