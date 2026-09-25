import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';
import lab from '../components/study/StudyLab.module.css';
import PracticeBox from '../components/study/PracticeBox.jsx';
import Quiz from '../components/study/Quiz.jsx';
import { affectedPackages, buildOrder } from '../components/study/studyLogic.js';

// { 패키지: [내가 의존하는 패키지] }
const DEPS = {
  web: ['ui', 'api-client', 'utils'],
  mobile: ['ui', 'api-client'],
  admin: ['ui', 'utils'],
  ui: ['utils'],
  'api-client': ['utils'],
  utils: [],
};
const LAYERS = [
  { label: 'apps/ (실제 배포되는 앱)', pkgs: ['web', 'mobile', 'admin'] },
  { label: 'packages/ (공유 코드)', pkgs: ['ui', 'api-client'] },
  { label: 'packages/ (가장 바닥)', pkgs: ['utils'] },
];
const BUILD_SECONDS = { web: 40, mobile: 60, admin: 30, ui: 20, 'api-client': 10, utils: 5 };
const ALL = Object.keys(DEPS);

const QUIZ = [
  {
    q: '모노레포(monorepo)란?',
    options: ['저장소 하나에 여러 프로젝트(앱·라이브러리)를 함께 두는 것', '프로젝트를 하나만 만드는 것', '마이크로서비스를 하나로 합치는 것'],
    answer: 0,
    why: '"한 집에 여러 가족이 사는 아파트"예요. 모놀리스(한 덩어리 앱)와는 다른 말이에요 — 모노레포 안의 앱들은 따로 빌드·배포할 수 있어요.',
  },
  {
    q: 'package.json에서 "@my/ui": "workspace:*" 의 뜻은?',
    options: ['npm에서 최신 버전을 받는다', '같은 저장소 안의 ui 패키지를 연결해서 쓴다', '아무 버전이나 괜찮다'],
    answer: 1,
    why: 'pnpm/Yarn 워크스페이스 문법이에요. npm에 올리지 않고도 저장소 안의 패키지를 바로 가져다 써요(심볼릭 링크).',
  },
  {
    q: 'Turborepo/Nx의 "원격 캐시"가 주는 가장 큰 이득은?',
    options: ['코드가 짧아진다', '누군가 이미 빌드한 결과를 내려받아 빌드를 건너뛴다', '보안이 좋아진다'],
    answer: 1,
    why: '입력(코드·설정)이 같으면 결과도 같다는 점을 이용해요. 동료나 CI가 한 번 빌드했으면 나는 결과만 받아 쓰면 끝!',
  },
  {
    q: '모노레포의 단점으로 알맞은 것은?',
    options: ['공유 코드 수정이 어렵다', '저장소가 커지면 도구·권한 관리가 필요하다', '원자적 커밋이 불가능하다'],
    answer: 1,
    why: '규모가 커지면 CI 시간, CODEOWNERS(담당자), 빌드 도구 설정이 중요해져요. 오히려 여러 패키지를 한 커밋에 고치는 원자적 커밋은 장점입니다.',
  },
];

const TOPO_PRACTICE = `// 위상 정렬: "재료부터 먼저" 빌드 순서 정하기
// deps: { 패키지: [내가 의존하는 패키지] }
const deps = {
  web: ['ui', 'utils'],
  ui: ['utils'],
  utils: [],
  docs: ['ui'],
};

function buildOrder(deps) {
  const visited = new Set();
  const order = [];
  function visit(pkg) {
    if (visited.has(pkg)) return;
    visited.add(pkg);
    deps[pkg].forEach(visit); // 재료(의존성) 먼저 방문
    order.push(pkg);          // 재료가 다 끝나면 나를 추가
  }
  Object.keys(deps).forEach(visit);
  return order;
}

console.log(buildOrder(deps));

// 🧪 도전 1: deps에 mobile: ['ui'] 를 추가해 보세요.
// 🧪 도전 2: utils: ['web'] 으로 바꾸면? (순환 의존! 실제 도구는 에러를 냅니다)
`;

function AffectedSimulator() {
  const [changed, setChanged] = useState('ui');
  const [cache, setCache] = useState(true);

  const affected = affectedPackages(DEPS, changed);
  const toBuild = cache ? buildOrder(DEPS, affected) : buildOrder(DEPS, ALL);
  const seconds = toBuild.reduce((sum, p) => sum + BUILD_SECONDS[p], 0);
  const fullSeconds = ALL.reduce((sum, p) => sum + BUILD_SECONDS[p], 0);

  return (
    <div>
      <p className={lab.muted}>패키지를 눌러서 &quot;내가 이걸 고쳤다&quot;고 해 보세요. 🟥 = 고친 것, 🟨 = 영향 받아서 다시 빌드/테스트해야 하는 것.</p>
      <div className={lab.graph}>
        {LAYERS.map((layer) => (
          <div key={layer.label}>
            <div className={lab.graphLayerLabel}>{layer.label}</div>
            <div className={lab.graphLayer}>
              {layer.pkgs.map((pkg) => {
                let state = '';
                if (pkg === changed) state = lab.pkgChanged;
                else if (affected.includes(pkg)) state = lab.pkgAffected;
                return (
                  <button key={pkg} type="button" className={`${lab.pkg} ${state}`} onClick={() => setChanged(pkg)}>
                    {pkg}
                    <br />
                    <small>→ {DEPS[pkg].join(', ') || '의존 없음'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <label className={lab.row}>
        <input type="checkbox" checked={cache} onChange={(e) => setCache(e.target.checked)} />
        Turborepo 캐시 + 영향 분석 켜기 (끄면 매번 전부 빌드)
      </label>
      <p>
        빌드 순서: <b>{toBuild.join(' → ')}</b>
        <br />
        예상 시간: <b className={cache ? lab.good : lab.bad}>{seconds}초</b>
        <span className={lab.muted}> (전체 빌드 {fullSeconds}초 대비 {Math.round((1 - seconds / fullSeconds) * 100)}% 절약)</span>
      </p>
    </div>
  );
}

export default function MonorepoView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏢 모노레포(Monorepo) 전략</h1>
        <p className={styles.description}>
          모노레포는 <b>여러 앱과 라이브러리를 저장소(Git repo) 하나에 모아 두는 방식</b>이에요.
          웹 앱·React Native 앱·관리자 페이지가 같은 버튼 컴포넌트와 API 코드를 나눠 쓴다면, 한 곳에 두는 게 훨씬 편하겠죠?
          대신 &quot;무엇을 다시 빌드해야 하나&quot;를 똑똑하게 계산하는 도구(Turborepo, Nx)가 필요해요.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 모노레포 vs 폴리레포</li>
          <li>2. 폴더 구조와 워크스페이스</li>
          <li>3. Turborepo: 태스크 파이프라인과 캐시</li>
          <li>4. 영향 분석(affected) 시뮬레이터</li>
          <li>5. 운영 전략 체크리스트</li>
          <li>6. 실습: 퀴즈 + 빌드 순서 연습장</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 모노레포 vs 폴리레포</h3>
        <div className={lab.tableWrap}>
          <table className={lab.table}>
            <thead><tr><th></th><th>폴리레포 (저장소 여러 개)</th><th>모노레포 (저장소 하나)</th></tr></thead>
            <tbody>
              <tr><td>비유</td><td>가족마다 단독주택</td><td>여러 가족이 사는 아파트</td></tr>
              <tr><td>공유 코드 수정</td><td>라이브러리 배포 → 각 앱에서 버전 올리기 (여러 PR)</td><td>한 PR에서 라이브러리와 앱을 같이 수정 (원자적 커밋)</td></tr>
              <tr><td>도구/설정</td><td>저장소마다 제각각</td><td>ESLint·TS·CI 설정을 한 번에 통일</td></tr>
              <tr><td>단점</td><td>버전 불일치, 중복 코드</td><td>저장소가 커짐, 빌드 도구·권한 관리 필요</td></tr>
              <tr><td>예시</td><td>작은 팀의 독립 서비스들</td><td>Google, Meta, Vercel(Next.js), Babel 저장소</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h3>2) 폴더 구조와 워크스페이스</h3>
        <p>보통 <b>apps/</b>(배포하는 것)과 <b>packages/</b>(나눠 쓰는 것)로 나눠요. pnpm 워크스페이스가 가장 많이 쓰입니다.</p>
        <div className={lab.compare}>
          <pre className={styles.code}><code>{`my-company/
├─ apps/
│  ├─ web/          (Next.js)
│  ├─ mobile/       (React Native)
│  └─ admin/        (Vite + React)
├─ packages/
│  ├─ ui/           (공용 버튼·카드)
│  ├─ api-client/   (서버 호출 함수)
│  ├─ utils/        (날짜·숫자 포맷)
│  └─ config/       (eslint, tsconfig)
├─ pnpm-workspace.yaml
├─ turbo.json
└─ package.json`}</code></pre>
          <pre className={styles.code}><code>{`# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

// apps/web/package.json
{
  "name": "@my/web",
  "dependencies": {
    "@my/ui": "workspace:*",
    "@my/utils": "workspace:*"
  }
}

# 특정 패키지에만 명령 실행
pnpm --filter @my/web dev
pnpm --filter "...@my/ui" test  # ui와 ui를 쓰는 모든 패키지`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h3>3) Turborepo: 태스크 파이프라인과 캐시</h3>
        <p>
          <code>turbo.json</code>에 &quot;build는 의존 패키지의 build가 끝난 뒤에(^build)&quot; 같은 규칙을 적어요.
          Turborepo는 입력 파일의 해시(지문)를 계산해서, 전에 본 지문이면 빌드를 건너뛰고 저장된 결과를 꺼내 줍니다(캐시 히트).
        </p>
        <pre className={styles.code}><code>{`// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],     // ^ = 내가 의존하는 패키지의 build 먼저
      "outputs": ["dist/**", ".next/**"]
    },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "dev":  { "cache": false, "persistent": true }
  }
}

// 실행
npx turbo run build            // 전체 (캐시된 건 FULL TURBO ⚡)
npx turbo run test --affected  // 바뀐 것과 영향 받는 것만`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) 영향 분석(affected) 시뮬레이터</h3>
        <AffectedSimulator />
      </section>

      <section className={styles.section}>
        <h3>5) 운영 전략 체크리스트</h3>
        <ul className={lab.steps}>
          <li><b>경계 지키기</b>: apps끼리는 서로 import 금지, 공유는 packages로만. (Nx의 module boundary 규칙, ESLint로 강제)</li>
          <li><b>담당자</b>: <code>CODEOWNERS</code>로 폴더별 리뷰어를 지정해 큰 저장소에서도 책임을 나눔</li>
          <li><b>버전 관리</b>: 외부에 배포하는 패키지는 Changesets로 변경 기록·버전 올리기 자동화</li>
          <li><b>CI 속도</b>: affected만 테스트 + 원격 캐시(Turborepo Remote Cache, Nx Cloud)</li>
          <li><b>의존성 통일</b>: React 같은 핵심 라이브러리는 루트에서 한 버전으로 맞추기 (웹과 RN이 같은 React 버전을 쓰는지 주의)</li>
          <li><b>도구 선택</b>: 가볍게 시작 → pnpm workspace + Turborepo / 규칙·코드 생성까지 → Nx</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>6) 실습</h3>
        <Quiz questions={QUIZ} />
        <PracticeBox
          title="빌드 순서(위상 정렬) 연습장"
          initialCode={TOPO_PRACTICE}
          hint="위 시뮬레이터의 '빌드 순서'도 바로 이 알고리즘으로 계산해요."
        />
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
