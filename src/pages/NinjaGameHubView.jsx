import styles from './NinjaGameHubView.module.css';

const scenarioActs = [
  {
    id: '01',
    title: '초원 전선',
    kicker: 'Stage 1',
    summary:
      '국경 전선이 무너지며 봉인 유물의 흔적이 초원에 흩어졌습니다. 플레이어는 소용돌이 제단 방으로 들어가 청람 구슬을 확보하고, 전선대장을 무너뜨려야 합니다.',
    highlight: '청람 구슬 획득 후 ITEM 스킬 `청람 나선옥` 해금',
  },
  {
    id: '02',
    title: '폭풍 성채',
    kicker: 'Stage 2',
    summary:
      '폭풍이 몰아치는 성채 외곽을 돌파하며 천뢰 병기고를 찾아야 합니다. 인장을 확보하면 천뢰 관통선으로 전장을 찢고, 용 보스 카이라의 브레스와 돌진을 견뎌야 합니다.',
    highlight: '천뢰 인장 획득 후 ITEM 스킬 `천뢰 관통선` 해금',
  },
  {
    id: '03',
    title: '적월의 방',
    kicker: 'Stage 3',
    summary:
      '세 갈래 포털 중 하나를 선택해 마지막 시험의 방으로 들어갑니다. 적월 가면을 회수해야 최종 보스 봉인이 풀리며, 방 전체를 장악하는 악몽 탄막을 돌파해야 합니다.',
    highlight: '적월 가면 획득 후 ITEM 스킬 `적월 수호진` 해금',
  },
];

const gameplayGuides = [
  {
    title: '기본 이동',
    detail: '`A / D` 또는 모바일 `BACK / GO` 버튼으로 이동합니다.',
  },
  {
    title: '점프와 진입',
    detail: '`W / SPACE` 또는 모바일 `JUMP`로 점프하고 문·포털도 진입합니다.',
  },
  {
    title: '기본 공격',
    detail: '`S`는 기본 공격(쿠나이)이며, `Q`와 `E`도 전투 공격 기술 키로 사용합니다.',
  },
  {
    title: '캐릭터 궁극기',
    detail: '`Q`는 캐릭터 궁극기 공격 키입니다.',
  },
  {
    title: '전용 기술',
    detail: '`E`는 분신술, 스사노오, 힐링 같은 캐릭터별 공격/특수 기술 키입니다.',
  },
  {
    title: '아이템 기술',
    detail: '아이템을 획득한 뒤에는 `Shift` 키로 아이템 특수 기술을 발동합니다.',
  },
];

const architectureCards = [
  {
    title: 'Route Layer',
    body:
      '`App.jsx` 라우팅이 `/ninja-game-hub`를 마지막 워크플로우 화면으로 연결하고, 여기서 게임 실행과 문서 열람을 함께 담당합니다.',
  },
  {
    title: 'Workflow Hub',
    body:
      '`NinjaGameHubView`는 시나리오, 플레이 방법, 산출물, Codex 설계를 한 화면에서 요약하는 결과 허브 역할을 합니다.',
  },
  {
    title: 'Game Runtime',
    body:
      '`public/games/ninja/index.html`이 Phaser 런타임을 올리고, `script.js`가 씬, 보스, 아이템, 모바일 입력을 모두 제어합니다.',
  },
  {
    title: 'Scene Systems',
    body:
      '`PreloadScene -> TitleScene -> SelectScene -> StoryScene -> GameScene` 흐름으로 이어지며, `GameScene`에서 스테이지/보스/유물/터치 UI가 통합됩니다.',
  },
  {
    title: 'Codex Workflow',
    body:
      '`plan.md`, `add.md`, `make.md`, `fun.md`, `qa.md`, `result.md`와 공개 문서 패키지가 함께 유지되며 결과 허브와 동기화됩니다.',
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
          <h1 className={styles.title}>NH Ninja V10.0 Mission Result</h1>
          <p className={styles.description}>
            게임 시나리오, 플레이 방법, Codex 아키텍처, 워크플로우 산출물을 한 화면에
            정리한 최종 허브입니다. 이 페이지에서 구조를 확인하고 바로 게임을
            시작할 수 있습니다.
          </p>

          <div className={styles.badges}>
            <span>3 Stage Story</span>
            <span>3 Relic Skills</span>
            <span>Mobile Touch Ready</span>
            <span>Codex Workflow Synced</span>
          </div>
        </div>

        <aside className={styles.launchPanel}>
          <div className={styles.launchLabel}>Live Mission Access</div>
          <div className={styles.launchValue}>Game + Docs Unified</div>
          <p className={styles.launchText}>
            결과 화면을 읽고 즉시 플레이로 넘어가는 구조입니다.
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
            윈도우 EXE와 macOS 실행 파일을 내려받아 바로 게임을 시작할 수 있습니다.
          </p>
        </aside>
      </section>

      <section className={`${styles.panel} ${styles.sectionPanel}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Game Scenario</p>
          <h2 className={styles.sectionTitle}>3막 시나리오</h2>
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
          <h2 className={styles.sectionTitle}>게임 방법</h2>
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
          <h2 className={styles.sectionTitle}>구조 문서</h2>
        </div>

        <div className={styles.archIntro}>
          <div className={styles.archFlow}>
            <span>`App.jsx`</span>
            <span>`NinjaGameHubView`</span>
            <span>`games/ninja/index.html`</span>
            <span>`script.js / Phaser Scenes`</span>
          </div>
          <p className={styles.archText}>
            Codex는 문서 산출물과 실행 페이지를 분리하지 않고, 최종 허브 화면에서
            바로 이해하고 실행할 수 있도록 구성했습니다.
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
          <h2 className={styles.sectionTitle}>최종 산출물 패키지</h2>
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
