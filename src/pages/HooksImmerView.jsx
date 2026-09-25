import { useCallback, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { produce } from 'immer';
import styles from './TopicDetailView.module.css';
import lab from '../components/study/StudyLab.module.css';
import PracticeBox from '../components/study/PracticeBox.jsx';

// 커스텀 Hook: use-immer 라이브러리의 useImmer를 5줄로 직접 만든 버전
function useImmerState(initial) {
  const [state, setState] = useState(initial);
  const update = useCallback((recipe) => setState((prev) => produce(prev, recipe)), []);
  return [state, update];
}

function MutationBugDemo() {
  const [fruits, setFruits] = useState(['🍎']);

  const wrongAdd = () => {
    fruits.push('🍌'); // ❌ 원본을 직접 수정
    setFruits(fruits); // 같은 배열(같은 주소)이라 React는 "안 바뀌었네" 하고 무시
  };
  const rightAdd = () => setFruits((prev) => [...prev, '🍇']); // ✅ 새 배열

  return (
    <div className={lab.demoCard}>
      <h4>🐞 데모 1: 직접 고치면 화면이 안 바뀐다</h4>
      <p style={{ fontSize: '1.6rem', margin: '6px 0' }}>{fruits.join(' ')}</p>
      <div className={lab.row}>
        <button type="button" className={`${lab.btn} ${lab.btnDanger}`} onClick={wrongAdd}>❌ push로 🍌 추가</button>
        <button type="button" className={lab.btn} onClick={rightAdd}>✅ 새 배열로 🍇 추가</button>
        <button type="button" className={`${lab.btn} ${lab.btnGhost}`} onClick={() => setFruits(['🍎'])}>↺</button>
      </div>
      <p className={lab.muted}>
        ❌를 몇 번 누른 뒤 ✅를 눌러 보세요. 숨어 있던 🍌들이 한꺼번에 나타나요! 데이터는 이미 바뀌었는데 화면만 몰랐던 거예요.
      </p>
    </div>
  );
}

const INITIAL_USER = {
  name: '불코딩',
  profile: { address: { city: '서울', zip: '04524' }, hobbies: ['코딩'] },
};

function NestedUpdateDemo() {
  const [user, updateUser] = useImmerState(INITIAL_USER);
  const [check, setCheck] = useState(null);

  const run = (label, recipe) => {
    const next = produce(user, recipe);
    setCheck({
      label,
      rootChanged: next !== user,
      addressShared: next.profile.address === user.profile.address,
      hobbiesShared: next.profile.hobbies === user.profile.hobbies,
    });
    updateUser(recipe);
  };

  return (
    <div className={lab.demoCard}>
      <h4>🪆 데모 2: 깊은 객체를 Immer로 고치기</h4>
      <pre className={lab.miniCode}><code>{JSON.stringify(user, null, 2)}</code></pre>
      <div className={lab.row}>
        <button type="button" className={lab.btn} onClick={() => run('city 변경', (d) => { d.profile.address.city = d.profile.address.city === '서울' ? '부산' : '서울'; })}>
          도시 바꾸기
        </button>
        <button type="button" className={lab.btn} onClick={() => run('hobby 추가', (d) => { d.profile.hobbies.push('게임'); })}>
          취미 추가
        </button>
        <button type="button" className={`${lab.btn} ${lab.btnGhost}`} onClick={() => { updateUser(() => INITIAL_USER); setCheck(null); }}>↺</button>
      </div>
      {check && (
        <ul className={lab.steps}>
          <li>[{check.label}] 새 user 객체가 만들어졌나? <b className={lab.good}>{String(check.rootChanged)}</b></li>
          <li>address는 그대로 재사용? <b className={check.addressShared ? lab.good : lab.bad}>{String(check.addressShared)}</b></li>
          <li>hobbies는 그대로 재사용? <b className={check.hobbiesShared ? lab.good : lab.bad}>{String(check.hobbiesShared)}</b></li>
        </ul>
      )}
      <p className={lab.muted}>바뀐 가지만 새로 만들고 나머지는 재사용해요(구조적 공유). 그래서 React.memo가 잘 동작하고 메모리도 아껴요.</p>
    </div>
  );
}

// useReducer + Immer: produce에 함수만 넘기면 (state, action) => 새 state 리듀서가 됩니다.
const todoReducer = produce((draft, action) => {
  switch (action.type) {
    case 'add':
      draft.push({ id: Date.now(), text: action.text, done: false });
      break;
    case 'toggle': {
      const todo = draft.find((t) => t.id === action.id);
      if (todo) todo.done = !todo.done;
      break;
    }
    case 'remove':
      return draft.filter((t) => t.id !== action.id); // 새 값을 return 해도 됨
    default:
      break;
  }
});

function ReducerTodoDemo() {
  const [todos, dispatch] = useReducer(todoReducer, [{ id: 1, text: 'Immer 배우기', done: false }]);
  const [text, setText] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: 'add', text: text.trim() });
    setText('');
  };

  return (
    <div className={lab.demoCard}>
      <h4>📝 데모 3: useReducer + Immer 할 일 목록</h4>
      <form className={lab.row} onSubmit={add}>
        <input className={lab.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="할 일 입력" aria-label="할 일" />
        <button type="submit" className={lab.btn}>추가</button>
      </form>
      <ul className={lab.steps}>
        {todos.map((t) => (
          <li key={t.id}>
            <label style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggle', id: t.id })} /> {t.text}
            </label>{' '}
            <button type="button" className={`${lab.btn} ${lab.btnGhost}`} onClick={() => dispatch({ type: 'remove', id: t.id })}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const IMMER_PRACTICE = `// produce(원본, 레시피) → 새 상태
// 레시피 안의 draft는 "마음껏 고쳐도 되는 연습장 복사본"이에요.

const base = {
  user: { name: '불코딩', level: 1 },
  items: ['칼', '방패'],
};

const next = produce(base, (draft) => {
  draft.user.level += 1;   // 그냥 고치듯이 쓰면
  draft.items.push('물약'); // Immer가 알아서 새 객체를 만들어 줌
});

console.log('원본:', base);
console.log('새것:', next);
console.log('원본은 안 바뀜?', base.user.level === 1);
console.log('user는 새 객체?', base.user !== next.user);

// 🧪 도전 1: items는 안 건드리고 user만 바꾸면, items는 재사용될까요?
// 🧪 도전 2: 결과는 얼어 있어요(freeze). 아래 주석을 풀고 실행해 보세요.
// next.user.level = 999;
console.log('얼어 있음?', Object.isFrozen(next));
`;

export default function HooksImmerView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🪝 React Hooks + 🥶 Immer</h1>
        <p className={styles.description}>
          React는 상태가 &quot;새 물건&quot;으로 바뀌었을 때만 화면을 다시 그려요. 그래서 원본을 고치지 말고 복사본을 만들어야 하죠(불변성).
          그런데 객체가 깊어지면 복사 코드가 지옥이 됩니다. <b>Immer</b>는 &quot;그냥 고치듯이 쓰면 복사본은 내가 만들어 줄게&quot;라는 라이브러리예요.
          이 페이지의 데모는 전부 진짜 React + 진짜 Immer로 동작합니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. Hooks 한눈에 보기 + 규칙 2가지</li>
          <li>2. 왜 원본을 고치면 안 될까? (🐞 버그 재현 데모)</li>
          <li>3. Immer의 원리: draft와 구조적 공유 (🪆 데모)</li>
          <li>4. useReducer + Immer (📝 데모)</li>
          <li>5. 커스텀 Hook: useImmerState 직접 만들기</li>
          <li>6. 실습: produce 연습장</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) Hooks 한눈에 보기</h3>
        <div className={lab.tableWrap}>
          <table className={lab.table}>
            <thead><tr><th>Hook</th><th>한 줄 설명 (12살 버전)</th></tr></thead>
            <tbody>
              <tr><td>useState</td><td>바뀌면 화면을 다시 그리는 기억 상자</td></tr>
              <tr><td>useReducer</td><td>&quot;무슨 일이 있었는지(action)&quot;를 보내면 규칙대로 상태를 바꿔 주는 관리인</td></tr>
              <tr><td>useEffect</td><td>화면을 그린 뒤 할 일(서버 요청, 타이머). 정리(cleanup)도 챙김</td></tr>
              <tr><td>useRef</td><td>바뀌어도 화면은 안 다시 그리는 비밀 메모장 / DOM 손잡이</td></tr>
              <tr><td>useMemo / useCallback</td><td>계산 결과·함수를 기억해 두고 재사용</td></tr>
              <tr><td>useContext</td><td>멀리 있는 조상이 준 값을 바로 꺼내 쓰기</td></tr>
              <tr><td>커스텀 Hook</td><td>위 Hook들을 묶어서 내가 만든 use○○ 함수</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 10 }}>
          <b>규칙 ①</b> Hook은 컴포넌트(또는 커스텀 Hook) 맨 위에서만 부른다 — if·for 안에서 부르면 순서가 꼬여요.
          <b> 규칙 ②</b> 이름은 use로 시작한다. 더 자세한 기본 Hook은 <Link to="/hook-guide">React 기본 Hook 가이드</Link>를 보세요.
        </p>
      </section>

      <section className={styles.section}>
        <h3>2) 왜 원본을 고치면 안 될까?</h3>
        <p>
          React는 이전 상태와 새 상태를 <code>Object.is(이전, 새것)</code>로 비교해요. 내용이 아니라 &quot;같은 물건인가(주소)&quot;를 봅니다.
          배열에 push하면 내용은 바뀌어도 같은 물건이라 React는 변화를 못 알아채요.
        </p>
        <MutationBugDemo />
      </section>

      <section className={styles.section}>
        <h3>3) Immer의 원리</h3>
        <p>
          produce를 부르면 Immer가 원본 대신 <b>draft(가짜 대역, Proxy)</b>를 줘요. draft를 고치면 Immer가 &quot;어디를 고쳤는지&quot; 적어 두었다가,
          끝나면 <b>고친 가지만 새로 만들고 나머지는 원본을 재사용</b>한 새 객체를 돌려줍니다. 결과는 실수로 못 고치게 얼려(freeze) 둬요.
        </p>
        <div className={lab.compare}>
          <pre className={styles.code}><code>{`// 😵 Immer 없이 (스프레드 지옥)
setUser(prev => ({
  ...prev,
  profile: {
    ...prev.profile,
    address: {
      ...prev.profile.address,
      city: '부산',
    },
  },
}));`}</code></pre>
          <pre className={styles.code}><code>{`// 😎 Immer로
import { produce } from 'immer';

setUser(prev =>
  produce(prev, draft => {
    draft.profile.address.city = '부산';
  })
);`}</code></pre>
        </div>
        <NestedUpdateDemo />
        <p className={lab.hint}>
          ⚠️ 레시피에서는 draft를 고치거나 새 값을 return 하거나 <b>둘 중 하나만</b> 하세요. 둘 다 하면 에러가 나요.
        </p>
      </section>

      <section className={styles.section}>
        <h3>4) useReducer + Immer</h3>
        <p><code>produce(레시피)</code>처럼 함수만 넘기면 리듀서가 돼요(커링). switch 안에서 push·대입을 그냥 써도 불변성이 지켜집니다.</p>
        <pre className={styles.code}><code>{`const todoReducer = produce((draft, action) => {
  switch (action.type) {
    case 'add':    draft.push({ id: Date.now(), text: action.text, done: false }); break;
    case 'toggle': { const t = draft.find(t => t.id === action.id); if (t) t.done = !t.done; break; }
    case 'remove': return draft.filter(t => t.id !== action.id);
  }
});

const [todos, dispatch] = useReducer(todoReducer, []);`}</code></pre>
        <ReducerTodoDemo />
      </section>

      <section className={styles.section}>
        <h3>5) 커스텀 Hook: useImmerState 직접 만들기</h3>
        <p>
          데모 2는 아래 5줄짜리 커스텀 Hook으로 만들었어요. 실무에서는 같은 역할의 <code>use-immer</code> 패키지를 쓰기도 합니다.
          Zustand도 <code>immer</code> 미들웨어를 제공해서 스토어 안에서 똑같이 쓸 수 있어요.
        </p>
        <pre className={styles.code}><code>{`function useImmerState(initial) {
  const [state, setState] = useState(initial);
  const update = useCallback(
    (recipe) => setState(prev => produce(prev, recipe)),
    [],
  );
  return [state, update];
}

// 사용
const [user, updateUser] = useImmerState({ profile: { city: '서울' } });
updateUser(d => { d.profile.city = '부산'; });`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>6) 실습: produce 연습장</h3>
        <p>이 연습장에는 진짜 Immer의 <code>produce</code>가 연결되어 있어요. 고치고 실행해 보세요.</p>
        <PracticeBox
          title="Immer produce 연습장"
          initialCode={IMMER_PRACTICE}
          scope={{ produce }}
          hint="도전 2의 주석을 풀면 에러가 나야 정상이에요. 얼린 객체를 고치려 했기 때문이죠."
        />
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
