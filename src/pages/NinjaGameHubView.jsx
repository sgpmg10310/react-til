import styles from './NinjaGameHubView.module.css';

const scenarioActs = [
  {
    id: '01',
    title: '초원 전선',
    kicker: 'Stage 1',
    summary:
      '전장 외곽이 무너지며 적 잔당이 초원 지대로 밀려들었습니다. 플레이어는 소용돌이 제단으로 들어가 청람 구슬을 회수하고, 전선 지휘관을 격파해 첫 방어선을 되찾아야 합니다.',
    highlight: '청람 구슬 확보 후 ITEM 스킬 `청람 나선옥` 해금',
  },
  {
    id: '02',
    title: '천뢰 성곽',
    kicker: 'Stage 2',
    summary:
      '폭풍이 몰아치는 성곽 깊숙한 병기고에서 천뢰 인장을 확보한 뒤, 성문을 넘어 드래곤 방으로 진입합니다. 여기서는 거대 용의 브레스와 돌진 패턴을 버티며 두 번째 유물을 완성해야 합니다.',
    highlight: '천뢰 인장 확보 후 ITEM 스킬 `천뢰 관통선` 해금',
  },
  {
    id: '03',
    title: '적월의 방',
    kicker: 'Stage 3',
    summary:
      '마지막 시험에서는 포털을 골라 방에 들어가 적월 가면을 먼저 회수해야 합니다. 가면을 손에 넣는 순간 최종 보스의 봉인이 풀리고, 광역 탄막과 순간이동 패턴을 넘겨야 작전이 종료됩니다.',
    highlight: '적월 가면 확보 후 ITEM 스킬 `적월 수호진` 해금',
  },
];

const gameplayGuides = [
  {
    title: '이동과 점프',
    detail:
      '`A / D`로 이동하고 `W / SPACE`로 점프합니다. 모바일에서는 왼쪽 조이스틱과 `JUMP` 버튼으로 같은 동작을 수행합니다.',
  },
  {
    title: '기본 전투',
    detail:
      '`S`는 기본 공격, `Q`는 강한 전투 스킬, `E`는 캐릭터별 특수 기술입니다. 보스전은 세 기술을 섞어 딜 타이밍을 만드는 구조입니다.',
  },
  {
    title: '유물 스킬',
    detail:
      '스테이지마다 유물을 확보하면 `Shift` 또는 모바일 `ITEM` 버튼으로 추가 기술을 쓸 수 있습니다. 각 유물은 이후 보스전의 공략 템포를 바꿉니다.',
  },
  {
    title: '방 진입 규칙',
    detail:
      '제단, 성문, 포털은 가까이에서 `JUMP`를 눌러 진입합니다. 각 방은 유물 획득이나 보스 해금과 직접 연결됩니다.',
  },
  {
    title: '모바일 지원',
    detail:
      '터치 UI는 이동, 점프, 공격, 스킬, ITEM까지 모두 분리되어 있습니다. 성능 프로필도 모바일 기준으로 적 수와 파티클을 자동 조정합니다.',
  },
  {
    title: '스테이지 목표',
    detail:
      'HUD의 `MISSION` 문구가 현재 목표를 계속 갱신합니다. 유물 확보 전, 보스 호출 전, 보스 격파 직전의 목표가 모두 다르게 바뀝니다.',
  },
];

const architectureCards = [
  {
    title: 'Route Layer',
    body:
      '`App.jsx`가 `/ninja-game-hub`를 결과 허브로 연결하고, 여기서 문서 확인과 게임 실행을 함께 제공합니다.',
  },
  {
    title: 'Workflow Hub',
    body:
      '`NinjaGameHubView`는 스토리, 조작법, 산출물, 참조 문서를 한 화면에 모아 시작 전 브리핑 역할을 합니다.',
  },
  {
    title: 'Game Runtime',
    body:
      '`public/games/ninja/index.html`이 Phaser 런타임을 열고 `script.js`가 씬 전환, 전투, 보스, 유물, 모바일 입력을 통합 제어합니다.',
  },
  {
    title: 'Scene Flow',
    body:
      '`TitleScene -> SelectScene -> StoryScene -> GameScene` 흐름으로 이어지며, 실제 플레이 목표는 Stage 1 유물 확보부터 최종 보스 격파까지 순차적으로 열립니다.',
  },
  {
    title: 'Result Package',
    body:
      '`plan.md`, `add.md`, `make.md`, `fun.md`, `qa.md`, `result.md`와 게임 문서 묶음이 현재 구현 상태를 설명하는 산출물 패키지입니다.',
  },
];

const workflowOutputs = [
  'plan.md',
  'add.md',
  'make.md',
  'fun.md',
  'qa.md',
  'result.md',
  'system_map.md',
  'public/games/ninja/docs/game-map.md',
  'public/games/ninja/docs/architecture-map.md',
  'public/games/ninja/docs/workflow-result.md',
  'public/games/ninja/docs/result.md',
];

const docLinks = [
  { title: 'Result HTML', href: 'games/ninja/docs/result.html' },
  { title: 'Workflow Result', href: 'games/ninja/docs/workflow-result.html' },
  { title: 'Game Map', href: 'games/ninja/docs/game-map.md' },
  { title: 'Architecture Map', href: 'games/ninja/docs/architecture-map.md' },
];

export default function NinjaGameHubView() {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <main className={styles.wrapper}>
      <div className={styles.aurora} aria-hidden="true" />

      <section className={`${styles.panel} ${styles.heroPanel}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Codex Final Workflow Screen</p>
          <h1 className={styles.title}>나루토 닌자 맛 게임 시작 허브</h1>
          <p className={styles.description}>
            현재 구현된 스테이지 구조, 유물 루프, 보스전 흐름, 모바일 지원, 워크플로우 산출물을 한 화면에서
            다시 정리한 시작 허브입니다. 문서를 먼저 확인한 뒤 바로 게임으로 진입할 수 있게 구성했습니다.
          </p>

          <div className={styles.badges}>
            <span>3 Stage Mission Flow</span>
            <span>Relic Unlock Loop</span>
            <span>Boss Transition Safe</span>
            <span>Mobile Touch Ready</span>
          </div>
        </div>

        <aside className={styles.launchPanel}>
          <div className={styles.launchLabel}>Live Mission Access</div>
          <div className={styles.launchValue}>Game + Docs Unified</div>
          <p className={styles.launchText}>
            이 페이지에서 스토리와 산출물을 확인하고, 같은 흐름으로 실제 게임 시작 화면과 본편으로 이어집니다.
          </p>
          <button
            type="button"
            className={styles.startButton}
            onClick={() => window.open(`${baseUrl}games/ninja/index.html`, '_blank')}
          >
            GAME START
          </button>
          <a
            className={styles.downloadButton}
            href={`${baseUrl}downloads/NH-Ninja-Setup.exe`}
            download
          >
            WINDOWS EXE DOWNLOAD
          </a>
          <a
            className={styles.downloadButton}
            href={`${baseUrl}downloads/NH-Ninja-macOS`}
            download
          >
            MACOS APP DOWNLOAD
          </a>
          <p className={styles.downloadHint}>
            배포 파일은 허브 설명과 같은 스테이지 구조, 유물 해금, 보스전 흐름을 기준으로 동작합니다.
          </p>
        </aside>
      </section>

      <section className={`${styles.panel} ${styles.sectionPanel}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Game Scenario</p>
          <h2 className={styles.sectionTitle}>현재 플레이 기준 스토리 흐름</h2>
        </div>
        <div className={styles.storyGrid}>
          {scenarioActs.map((act) => (
            <article key={act.id} className={styles.storyCard}>
              <div className={styles.storyTop}>
                <span className={styles.storyId}>{act.id}</span>
                <span className={styles.storyKicker}>{act.kicker}</span>
              </div>
              <h3 className={styles.cardTitle}>{act.title}</h3>
              <p className={styles.cardBody}>{act.summary}</p>
              <p className={styles.cardHighlight}>{act.highlight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.sectionPanel}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>How To Play</p>
          <h2 className={styles.sectionTitle}>현재 동작 방식</h2>
        </div>
        <div className={styles.guideGrid}>
          {gameplayGuides.map((guide) => (
            <article key={guide.title} className={styles.guideCard}>
              <h3 className={styles.cardTitle}>{guide.title}</h3>
              <p className={styles.cardBody}>{guide.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.sectionPanel}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Codex Architecture</p>
          <h2 className={styles.sectionTitle}>산출물과 런타임 연결 구조</h2>
        </div>

        <div className={styles.archIntro}>
          <div className={styles.archFlow}>
            <span>`App.jsx`</span>
            <span>`NinjaGameHubView`</span>
            <span>`games/ninja/index.html`</span>
            <span>`script.js / Phaser Scenes`</span>
          </div>
          <p className={styles.archText}>
            시작 허브에서 문서와 실행을 분리하지 않고 연결해 두었습니다. 사용자는 스토리와 조작법을 보고
            곧바로 게임으로 들어가며, 내부 씬은 같은 미션 흐름을 그대로 이어받습니다.
          </p>
        </div>

        <div className={styles.archGrid}>
          {architectureCards.map((item) => (
            <article key={item.title} className={styles.archCard}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardBody}>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.sectionPanel}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Workflow Result</p>
          <h2 className={styles.sectionTitle}>시작 페이지에서 확인할 산출물</h2>
        </div>

        <div className={styles.outputGrid}>
          <div className={styles.outputPanel}>
            <p className={styles.outputLabel}>Result Package</p>
            <div className={styles.outputList}>
              {workflowOutputs.map((item) => (
                <span key={item} className={styles.outputItem}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.outputPanel}>
            <p className={styles.outputLabel}>Reference Docs</p>
            <div className={styles.linkList}>
              {docLinks.map((item) => (
                <a
                  key={item.href}
                  className={styles.docLink}
                  href={`${baseUrl}${item.href}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
