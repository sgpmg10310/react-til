import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';
import lab from '../components/study/StudyLab.module.css';
import PracticeBox from '../components/study/PracticeBox.jsx';
import Quiz from '../components/study/Quiz.jsx';
import { tokenize } from '../components/study/studyLogic.js';

const JSX_INPUT = `const App = () => <h1 className="title">안녕 {name}</h1>;`;

// SWC 변환 결과 예시 (읽기 쉽게 줄바꿈만 정리)
function jsxOutput(runtime, target) {
  const decl = target === 'es5' ? 'var' : 'const';
  const call = runtime === 'automatic'
    ? '/*#__PURE__*/ _jsxs("h1", { className: "title", children: ["안녕 ", name] })'
    : '/*#__PURE__*/ React.createElement("h1", { className: "title" }, "안녕 ", name)';
  const importLine = runtime === 'automatic' ? 'import { jsxs as _jsxs } from "react/jsx-runtime";\n' : '';
  const body = target === 'es5'
    ? `${decl} App = function() {\n  return ${call};\n};`
    : `${decl} App = () => ${call};`;
  return importLine + body;
}

const QUIZ = [
  {
    q: 'SWC는 무엇으로 만들어졌나요?',
    options: ['JavaScript', 'Rust', 'Java'],
    answer: 1,
    why: 'Rust로 만들어 기계어로 바로 돌고, CPU 코어 여러 개를 동시에 써요. 그래서 JS로 만든 Babel보다 훨씬 빨라요.',
  },
  {
    q: 'SWC가 TypeScript 코드를 변환할 때 하는 일은?',
    options: ['타입 오류를 검사한다', '타입 표시만 지우고 JS로 만든다', 'TS를 Java로 바꾼다'],
    answer: 1,
    why: 'SWC는 타입을 "지우기만" 해요(빠른 이유 중 하나). 타입 검사는 따로 tsc --noEmit 으로 해야 합니다.',
  },
  {
    q: 'target을 es5로 하면 화살표 함수는?',
    options: ['그대로 둔다', 'function으로 바꾼다', '지운다'],
    answer: 1,
    why: '옛날 브라우저(ES5)는 화살표 함수를 몰라서 function으로 바꿔 줘요. 위의 변환기에서 target을 바꿔 확인해 보세요.',
  },
];

const AST_PRACTICE = `// SWC 같은 컴파일러는 코드를 "나무(AST)"로 바꾼 뒤 가지를 고쳐요.
// 1 + 2 * 3 의 AST (SWC가 만드는 모양을 단순화)
const ast = {
  type: 'BinaryExpression', operator: '+',
  left: { type: 'NumericLiteral', value: 1 },
  right: {
    type: 'BinaryExpression', operator: '*',
    left: { type: 'NumericLiteral', value: 2 },
    right: { type: 'NumericLiteral', value: 3 },
  },
};

// Transform: 미리 계산할 수 있는 식을 숫자 하나로 접기 (상수 폴딩 = minify가 하는 일)
function fold(node) {
  if (node.type !== 'BinaryExpression') return node;
  const left = fold(node.left);
  const right = fold(node.right);
  if (left.type === 'NumericLiteral' && right.type === 'NumericLiteral') {
    if (node.operator === '+') return { type: 'NumericLiteral', value: left.value + right.value };
    // 🧪 도전: 여기에 '*' 처리를 추가하면 결과가 7이 돼요!
  }
  return { ...node, left, right };
}

// Codegen: 나무를 다시 코드 글자로
function print(node) {
  if (node.type === 'NumericLiteral') return String(node.value);
  return print(node.left) + ' ' + node.operator + ' ' + print(node.right);
}

console.log('변환 전:', print(ast));
console.log('변환 후:', print(fold(ast)));
`;

function JsxTransformer() {
  const [runtime, setRuntime] = useState('automatic');
  const [target, setTarget] = useState('es2020');

  return (
    <div>
      <div className={lab.row}>
        <span className={lab.badge}>jsc.transform.react.runtime</span>
        {['automatic', 'classic'].map((v) => (
          <button key={v} type="button" className={`${lab.btn} ${runtime === v ? '' : lab.btnGhost}`} onClick={() => setRuntime(v)}>{v}</button>
        ))}
      </div>
      <div className={lab.row}>
        <span className={lab.badge}>jsc.target</span>
        {['es2020', 'es5'].map((v) => (
          <button key={v} type="button" className={`${lab.btn} ${target === v ? '' : lab.btnGhost}`} onClick={() => setTarget(v)}>{v}</button>
        ))}
      </div>
      <div className={lab.compare}>
        <div>
          <p className={lab.muted}>입력 (JSX)</p>
          <pre className={styles.code}><code>{JSX_INPUT}</code></pre>
        </div>
        <div>
          <p className={lab.muted}>출력 (JS)</p>
          <pre className={styles.code}><code>{jsxOutput(runtime, target)}</code></pre>
        </div>
      </div>
      <p className={lab.muted}>
        automatic은 React 17+ 방식이라 파일마다 <code>import React</code>를 안 써도 돼요. <code>/*#__PURE__*/</code>는
        &quot;안 쓰이면 지워도 안전해&quot;라는 표시로, 번들러가 트리 셰이킹할 때 씁니다.
      </p>
    </div>
  );
}

function TokenizerDemo() {
  const [code, setCode] = useState("const total = price * 2 + 'won';");
  const tokens = tokenize(code);

  return (
    <div className={lab.demoCard}>
      <h4>✂️ 1단계 체험: 코드를 토큰으로 자르기 (직접 입력해 보세요)</h4>
      <input className={lab.input} style={{ width: '100%', boxSizing: 'border-box' }} value={code} onChange={(e) => setCode(e.target.value)} aria-label="토큰으로 자를 코드" />
      <div className={lab.tokens}>
        {tokens.map((t, i) => (
          <span key={`${i}-${t.value}`} className={`${lab.token} ${lab[`tk_${t.type}`]}`}>
            {t.value}
            <small>{t.type}</small>
          </span>
        ))}
      </div>
      <p className={lab.muted}>토큰 {tokens.length}개. 진짜 SWC는 이 토큰들로 AST(나무)를 만들어요.</p>
    </div>
  );
}

export default function SwcView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>⚡ SWC (Speedy Web Compiler)</h1>
        <p className={styles.description}>
          우리가 쓰는 JSX·TypeScript·최신 JS는 브라우저가 그대로 못 읽어요. 그래서 <b>번역기(컴파일러)</b>가 필요한데,
          예전엔 JS로 만든 <b>Babel</b>을 썼고, 지금은 Rust로 만든 초고속 번역기 <b>SWC</b>가 Next.js 등에서 기본으로 쓰여요.
          &quot;같은 번역을 훨씬 빨리 해 주는 번역가&quot;라고 생각하면 됩니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 컴파일러가 하는 일: Parse → Transform → Codegen (✂️ 토큰 체험)</li>
          <li>2. Babel · SWC · esbuild · Oxc 비교</li>
          <li>3. JSX 변환기: 설정에 따라 결과가 어떻게 바뀌나</li>
          <li>4. .swcrc 설정과 사용처 (Next.js, Vite, Jest)</li>
          <li>5. 우리 프로젝트는 무엇을 쓰고 있을까?</li>
          <li>6. 실습: 퀴즈 + AST 변환 연습장</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 컴파일러가 하는 일</h3>
        <div className={lab.pipeline}>
          <span className={lab.pipeStep}>① Parse: 글자 → 토큰 → AST(나무)</span><span className={lab.pipeArrow}>→</span>
          <span className={lab.pipeStep}>② Transform: 나무 가지 고치기</span><span className={lab.pipeArrow}>→</span>
          <span className={lab.pipeStep}>③ Codegen: 나무 → 새 코드</span>
        </div>
        <p>
          예를 들어 JSX <code>&lt;h1&gt;</code>를 함수 호출로 바꾸고, TS 타입을 지우고, 화살표 함수를 옛날 문법으로 바꾸는 일이 전부 ② 단계예요.
          압축(minify)도 같은 방식으로 이름을 짧게 하고 계산을 미리 해 둡니다.
        </p>
        <TokenizerDemo />
      </section>

      <section className={styles.section}>
        <h3>2) Babel · SWC · esbuild · Oxc 비교</h3>
        <div className={lab.tableWrap}>
          <table className={lab.table}>
            <thead><tr><th>도구</th><th>언어</th><th>특징</th><th>어디서 쓰나</th></tr></thead>
            <tbody>
              <tr><td>Babel</td><td>JavaScript</td><td>플러그인 생태계 최대, 상대적으로 느림</td><td>예전 CRA, 특수 플러그인이 필요할 때</td></tr>
              <tr><td>SWC</td><td>Rust</td><td>Babel과 비슷한 역할 + 매우 빠름, 멀티코어</td><td>Next.js 기본, Vite(plugin-react-swc), Jest(@swc/jest), Deno</td></tr>
              <tr><td>esbuild</td><td>Go</td><td>번들러 겸 변환기, 매우 빠름</td><td>Vite 7 이하 개발 서버, tsup</td></tr>
              <tr><td>Oxc</td><td>Rust</td><td>파서·변환기·린터(oxlint) 모음, 매우 빠름</td><td>Rolldown / Vite 8</td></tr>
            </tbody>
          </table>
        </div>
        <p className={lab.muted} style={{ marginTop: 8 }}>
          공통점: 요즘 도구는 &quot;JS로 만든 JS 도구&quot;에서 &quot;Rust·Go로 만든 JS 도구&quot;로 옮겨 가는 중이에요. 이유는 딱 하나, 속도!
        </p>
      </section>

      <section className={styles.section}>
        <h3>3) JSX 변환기</h3>
        <p>설정 버튼을 눌러 보세요. 같은 JSX가 설정에 따라 어떻게 다르게 번역되는지 보여 줘요. (SWC 출력 형태를 읽기 쉽게 정리한 예시)</p>
        <JsxTransformer />
      </section>

      <section className={styles.section}>
        <h3>4) .swcrc 설정과 사용처</h3>
        <div className={lab.compare}>
          <pre className={styles.code}><code>{`// .swcrc
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "parser": { "syntax": "typescript", "tsx": true },
    "transform": { "react": { "runtime": "automatic" } },
    "target": "es2020"
  },
  "module": { "type": "es6" },
  "sourceMaps": true
}

# CLI로 폴더 통째로 변환
npm i -D @swc/cli @swc/core
npx swc src -d dist`}</code></pre>
          <pre className={styles.code}><code>{`// ① Next.js: 설치 없이 기본으로 SWC 사용
// next.config.js
module.exports = {
  compiler: { removeConsole: true }, // 배포 때 console.* 제거
};

// ② Vite: SWC 버전 React 플러그인
import react from '@vitejs/plugin-react-swc';
export default { plugins: [react()] };

// ③ Jest: ts-jest/babel-jest 대신
// jest.config.js
module.exports = {
  transform: { '^.+\\\\.(t|j)sx?$': '@swc/jest' },
};`}</code></pre>
        </div>
        <p className={lab.hint}>⚠️ SWC는 타입을 지우기만 하고 검사하지 않아요. CI에서는 <code>tsc --noEmit</code>을 따로 돌려 타입 오류를 잡으세요.</p>
      </section>

      <section className={styles.section}>
        <h3>5) 우리 프로젝트는 무엇을 쓰고 있을까?</h3>
        <p>
          이 사이트(react-til)의 <code>package.json</code>을 보면 <b>Vite 8</b> + <b>@vitejs/plugin-react 6</b>이에요.
          Vite 8은 번들러로 <b>Rolldown</b>을 쓰고, JSX 변환은 그 안의 Rust 도구 <b>Oxc</b>가 해요. Babel은 쓰지 않아요.
          즉 SWC는 아니지만 &quot;Rust로 만든 빠른 변환기&quot;라는 같은 흐름 위에 있어요.
          SWC를 직접 써 보고 싶다면 Next.js 프로젝트를 만들거나, Jest 테스트에 <code>@swc/jest</code>를 붙여 보는 게 가장 쉬워요.
        </p>
      </section>

      <section className={styles.section}>
        <h3>6) 실습</h3>
        <Quiz questions={QUIZ} />
        <PracticeBox
          title="AST 변환(상수 폴딩) 연습장"
          initialCode={AST_PRACTICE}
          hint="SWC 플러그인도 원리는 똑같아요: 나무를 돌면서(visit) 원하는 가지를 찾아 바꿉니다."
        />
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
