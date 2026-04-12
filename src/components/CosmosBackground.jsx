import React, { useEffect, useRef } from 'react';

const CODE_SNIPPETS = [
  'const universe = await cosmos.expand();',
  '<Route path="/*" element={<App />} />',
  'git commit -m "feat: stardust"',
  'useMemo(() => orbit.compute(), [deps])',
  'npm run dev  // warp drive',
  'export async function warp() {}',
];

/**
 * 코딩 × 우주 테마: perspective 레이어 + 코드 조각이 3D 공간을 떠다님 (장식만, pointer-events 없음)
 * 스크롤 진행도는 --cosmos-scroll(0~1)로 배경 그라데이션 톤이 살짝 바뀜 (prefers-reduced-motion이면 고정)
 */
export default function CosmosBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const root = bgRef.current;
    if (!root) return undefined;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;

    const applyScrollProgress = () => {
      rafId = 0;
      if (mq.matches) {
        root.style.setProperty('--cosmos-scroll', '0');
        return;
      }
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      const p =
        scrollRange > 0
          ? Math.min(1, Math.max(0, scrollTop / scrollRange))
          : 0;
      root.style.setProperty('--cosmos-scroll', String(p));
    };

    const onScrollOrResize = () => {
      if (rafId !== 0) return;
      rafId = requestAnimationFrame(applyScrollProgress);
    };

    const detachScroll = () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafId !== 0) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const attachScroll = () => {
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });
    };

    const onReducedMotionChange = () => {
      if (mq.matches) {
        detachScroll();
        root.style.setProperty('--cosmos-scroll', '0');
      } else {
        attachScroll();
        applyScrollProgress();
      }
    };

    mq.addEventListener('change', onReducedMotionChange);
    if (!mq.matches) attachScroll();
    applyScrollProgress();

    return () => {
      mq.removeEventListener('change', onReducedMotionChange);
      detachScroll();
    };
  }, []);

  return (
    <div ref={bgRef} className="cosmos-bg" aria-hidden="true">
      <div className="cosmos-3d-stage">
        <div className="cosmos-layer cosmos-layer--deep">
          <div className="cosmos-stars" />
        </div>

        <div className="cosmos-layer cosmos-layer--orbit">
          <div className="cosmos-orbit-ring cosmos-orbit-ring--1" />
          <div className="cosmos-orbit-ring cosmos-orbit-ring--2" />
        </div>

        <div className="cosmos-nebula-stack">
          <div className="cosmos-nebula cosmos-nebula--a" />
          <div className="cosmos-nebula cosmos-nebula--b" />
          <div className="cosmos-nebula cosmos-nebula--c" />
        </div>

        <div className="cosmos-layer cosmos-layer--grid">
          <div className="cosmos-grid" />
          <div className="cosmos-binary-rain" />
        </div>

        <div className="cosmos-layer cosmos-layer--code">
          {CODE_SNIPPETS.map((text, i) => (
            <span
              key={text}
              className={`cosmos-code-satellite cosmos-code-satellite--s${i}`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
      <div className="cosmos-vignette" />
    </div>
  );
}
