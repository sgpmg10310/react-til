import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createHangulBgm } from './hangulBgmSynth.js';
import styles from './HangulGameBgm.module.css';

const LS_MUTED = 'hangul-bgm-muted';

export default function HangulGameBgm() {
  const bgmRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem(LS_MUTED) === '1');

  useEffect(() => {
    const bgm = createHangulBgm();
    bgmRef.current = bgm;
    bgm.setMuted(muted);
    return () => {
      bgm.dispose();
      bgmRef.current = null;
    };
  }, []);

  useEffect(() => {
    bgmRef.current?.setMuted(muted);
    localStorage.setItem(LS_MUTED, muted ? '1' : '0');
  }, [muted]);

  const startBgm = useCallback(async () => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    bgm.setMuted(muted);
    const ok = await bgm.start();
    if (ok) setRunning(true);
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const handleMainClick = useCallback(async () => {
    if (!running) await startBgm();
    else toggleMute();
  }, [running, startBgm, toggleMute]);

  let btnClass = styles.btnStart;
  let label = '🎵 배경음 켜기';
  if (running && !muted) {
    btnClass = styles.btnOn;
    label = '🔊 배경음 ON';
  } else if (running && muted) {
    btnClass = styles.btnOff;
    label = '🔇 배경음 OFF';
  }

  return (
    <div className={styles.fab} aria-live="polite">
      {!running && (
        <p className={styles.hint}>
          브라우저 정책 때문에 음악은 버튼을 누른 뒤에만 나와요. 한 번 켜 두면 모든 한글 게임에서 계속 들려요!
        </p>
      )}
      <button
        type="button"
        className={`${styles.btn} ${btnClass}`}
        onClick={handleMainClick}
      >
        {label}
      </button>
    </div>
  );
}
