import React from 'react';

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
 */
export default function CosmosBackground() {
  return (
    <div className="cosmos-bg" aria-hidden="true">
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
