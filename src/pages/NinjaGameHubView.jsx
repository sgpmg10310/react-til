import { useEffect, useMemo, useState } from 'react';
import styles from './NinjaGameHubView.module.css';

/**
 * 닌자 게임 진입 전, 결과물/구성도 문서를 순차적으로 보여주는 허브 화면입니다.
 */
export default function NinjaGameHubView() {
  const [visibleCount, setVisibleCount] = useState(0);

  const docLinks = useMemo(
    () => [
      {
        title: 'Result Stage (Markdown)',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/result.md`,
      },
      {
        title: 'Result Stage (HTML)',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/result.html`,
      },
      {
        title: 'Workflow Result (Markdown)',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/workflow-result.md`,
      },
      {
        title: 'Workflow Result (HTML)',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/workflow-result.html`,
      },
      {
        title: 'Game Map',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/game-map.md`,
      },
      {
        title: 'Architecture Map',
        href: `${import.meta.env.BASE_URL}games/ninja/docs/architecture-map.md`,
      },
    ],
    [],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= docLinks.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
    return () => window.clearInterval(timer);
  }, [docLinks.length]);

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Ninja Game Mission Hub</h1>
        <p className={styles.description}>
          Check workflow results and maps first, then start the game.
        </p>

        <div className={styles.links}>
          {docLinks.slice(0, visibleCount).map((item) => (
            <a
              key={item.href}
              className={styles.linkItem}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              {item.title}
            </a>
          ))}
        </div>

        <button
          type="button"
          className={styles.startButton}
          onClick={() => window.open(`${import.meta.env.BASE_URL}games/ninja/index.html`, '_blank')}
        >
          GAME START
        </button>
      </section>
    </main>
  );
}
