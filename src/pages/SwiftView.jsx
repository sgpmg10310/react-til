import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';
import lab from '../components/study/StudyLab.module.css';
import PracticeBox from '../components/study/PracticeBox.jsx';
import Quiz from '../components/study/Quiz.jsx';

const QUIZ = [
  {
    q: '이 코드는 어떻게 될까요?',
    code: 'let x = 5\nx = 6',
    options: ['x가 6이 된다', '컴파일 에러', '실행 중 크래시'],
    answer: 1,
    why: 'let은 "한 번 정하면 못 바꾸는 상자"예요. 바꾸려면 var로 만들어야 하고, Swift는 실행 전에(컴파일 때) 막아 줍니다.',
  },
  {
    q: 'struct는 복사하면 어떻게 될까요? 출력값은?',
    code: 'struct Point { var x: Int }\nvar a = Point(x: 1)\nvar b = a\nb.x = 99\nprint(a.x)',
    options: ['1', '99', '에러'],
    answer: 0,
    why: 'struct는 "값 타입"이라 b = a 할 때 통째로 복사본이 생겨요. b를 고쳐도 a는 그대로 1입니다.',
  },
  {
    q: '같은 코드를 class로 바꾸면 출력값은?',
    code: 'class Point { var x: Int; init(x: Int) { self.x = x } }\nlet a = Point(x: 1)\nlet b = a\nb.x = 99\nprint(a.x)',
    options: ['1', '99', '에러'],
    answer: 1,
    why: 'class는 "참조 타입"이라 a와 b가 같은 물건을 가리켜요. JS 객체와 똑같습니다. (let이어도 안의 var 속성은 바꿀 수 있어요)',
  },
  {
    q: '출력값은?',
    code: 'let name: String? = nil\nprint(name ?? "손님")',
    options: ['nil', '손님', '크래시'],
    answer: 1,
    why: '?? 는 "값이 없으면 이걸 대신 써"라는 뜻이에요. JS의 ?? 와 같습니다.',
  },
  {
    q: '[1, 2, 3].map { $0 * 2 } 의 결과는?',
    options: ['[1, 2, 3]', '[2, 4, 6]', '12'],
    answer: 1,
    why: '$0 은 클로저의 첫 번째 인자예요. JS로 쓰면 [1, 2, 3].map(n => n * 2) 입니다.',
  },
  {
    q: 'SwiftUI에서 값이 바뀌면 화면을 다시 그리게 하는 것은? (React의 useState 역할)',
    options: ['@State', 'let', 'protocol'],
    answer: 0,
    why: '@State 값이 바뀌면 SwiftUI가 body를 다시 계산해요. React에서 setState 하면 다시 렌더링되는 것과 같은 원리입니다.',
  },
];

const TRANSLATE_PRACTICE = `// Swift 코드를 JS로 옮겨 봤어요. 값을 바꿔 가며 실행해 보세요!

// Swift: let scores = [90, 72, 55, 100]
const scores = [90, 72, 55, 100];

// Swift: let passed = scores.filter { $0 >= 60 }
const passed = scores.filter((s) => s >= 60);

// Swift: let total = passed.reduce(0, +)
const total = passed.reduce((sum, s) => sum + s, 0);

// Swift: let nickname: String? = nil
const nickname = null;

// Swift: print("\\(nickname ?? "손님")님, 합격 점수 합계는 \\(total)")
console.log(\`\${nickname ?? '손님'}님, 합격 점수 합계는 \${total}\`);

// 🧪 도전: struct처럼 "복사본"을 만들려면?
const a = { x: 1 };
const b = { ...a }; // 복사 (Swift struct처럼)
b.x = 99;
console.log('a.x =', a.x, '/ b.x =', b.x);
`;

function OptionalSimulator() {
  const [text, setText] = useState('불코딩');
  const [isNil, setIsNil] = useState(false);
  const shown = isNil ? 'nil' : `"${text}"`;

  return (
    <div className={lab.demoCard}>
      <h4>🎁 Optional 상자 열기 시뮬레이터</h4>
      <p className={lab.muted}>Optional은 &quot;값이 들어 있을 수도, 비어 있을(nil) 수도 있는 선물 상자&quot;예요.</p>
      <div className={lab.row}>
        <input
          className={lab.input}
          value={text}
          disabled={isNil}
          onChange={(e) => setText(e.target.value)}
          aria-label="닉네임 값"
        />
        <label>
          <input type="checkbox" checked={isNil} onChange={(e) => setIsNil(e.target.checked)} /> 상자를 비우기(nil)
        </label>
      </div>
      <pre className={lab.miniCode}><code>{`let nickname: String? = ${shown}`}</code></pre>
      <div className={lab.demoGrid}>
        <div>
          <span className={lab.badge}>if let (안전하게 열기)</span>
          <pre className={lab.miniCode}><code>{'if let name = nickname {\n  print("안녕, \\(name)")\n} else {\n  print("닉네임이 없어요")\n}'}</code></pre>
          <p className={lab.good}>→ {isNil ? '닉네임이 없어요' : `안녕, ${text}`}</p>
        </div>
        <div>
          <span className={lab.badge}>?? (기본값 쓰기)</span>
          <pre className={lab.miniCode}><code>{'print(nickname ?? "손님")'}</code></pre>
          <p className={lab.good}>→ {isNil ? '손님' : text}</p>
        </div>
        <div>
          <span className={lab.badge}>! (강제로 열기)</span>
          <pre className={lab.miniCode}><code>{'print(nickname!)'}</code></pre>
          {isNil ? (
            <p className={lab.bad}>→ 💥 Fatal error: Unexpectedly found nil while unwrapping an Optional value (앱이 꺼져요!)</p>
          ) : (
            <p className={lab.good}>→ {text} (이번엔 운이 좋았어요)</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SwiftView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🍎 Swift 기초 (JS 개발자용)</h1>
        <p className={styles.description}>
          Swift는 애플이 만든 언어로 iPhone·iPad·Mac 앱을 만들 때 씁니다. JS를 알면 절반은 이미 아는 셈이에요.
          차이점은 딱 하나로 요약돼요: <b>&quot;실수를 실행 전에 잡는다&quot;</b> (타입·nil을 컴파일러가 검사).
          브라우저에서는 Swift를 직접 실행할 수 없어서, 아래 실습은 <b>시뮬레이터 · 결과 맞히기 · JS 번역 연습</b>으로 준비했어요.
          진짜로 돌려 보려면 Mac의 Xcode Playground나 swift.org의 온라인 실행기를 쓰세요.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. let / var 와 타입 추론</li>
          <li>2. Optional — nil을 안전하게 다루기 (🎁 시뮬레이터)</li>
          <li>3. struct(값) vs class(참조)</li>
          <li>4. 클로저와 map / filter</li>
          <li>5. enum + switch, protocol</li>
          <li>6. SwiftUI와 @State — React와 닮은 점</li>
          <li>7. 실습: 결과 맞히기 퀴즈 + JS 번역 연습장</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) let / var 와 타입 추론</h3>
        <p>
          <b>let</b>은 한 번 넣으면 못 바꾸는 상자(JS의 const), <b>var</b>는 바꿀 수 있는 상자(JS의 let)입니다.
          타입을 안 써도 Swift가 값을 보고 알아서 정해요(타입 추론). 하지만 한 번 정해진 타입은 못 바꿉니다.
        </p>
        <pre className={styles.code}><code>{`let name = "불코딩"      // String 으로 추론
var age = 12             // Int 로 추론
age = 13                 // ✅ var는 바꿀 수 있음
// age = "열세 살"        // ❌ 컴파일 에러: Int 자리에 String 불가

let pi: Double = 3.14    // 타입을 직접 적어도 됨
print("\\(name)는 \\(age)살") // 문자열 보간: JS의 \`\${}\`와 같음`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) Optional — nil을 안전하게 다루기</h3>
        <p>
          JS에서는 아무 변수나 undefined/null이 될 수 있어서 <code>Cannot read properties of undefined</code> 에러가 자주 나요.
          Swift는 &quot;비어 있을 수 있는 값&quot;에 <b>?</b> 표시를 붙이게 하고, 꺼내기 전에 꼭 확인하게 만듭니다.
        </p>
        <pre className={styles.code}><code>{`var nickname: String? = nil   // ? = 비어 있을 수도 있음

// 1. if let: 값이 있을 때만 꺼내서 사용
if let name = nickname { print(name) }

// 2. guard let: 없으면 바로 함수 탈출 (early return)
func greet(_ nickname: String?) {
  guard let name = nickname else { return }
  print("안녕, \\(name)")
}

// 3. ?? : 없으면 기본값
let display = nickname ?? "손님"

// 4. ?. : 옵셔널 체이닝 (JS와 같음)
let count = nickname?.count   // Int? 타입`}</code></pre>
        <OptionalSimulator />
      </section>

      <section className={styles.section}>
        <h3>3) struct(값 타입) vs class(참조 타입)</h3>
        <p>
          <b>struct</b>는 복사하면 &quot;복사본&quot;이 생기고(사진을 복사해서 한 장 더 뽑기),
          <b>class</b>는 복사해도 &quot;같은 물건&quot;을 가리켜요(같은 사진을 둘이 같이 보기).
          SwiftUI는 struct를 많이 써요. 이 &quot;원본을 안 건드리는 복사&quot; 생각은 React의 불변성·Immer와 똑같은 아이디어입니다.
        </p>
        <pre className={styles.code}><code>{`struct User {           // 값 타입
  var name: String
  mutating func rename(_ n: String) { name = n } // 자기 값을 바꾸는 메서드는 mutating
}

class Counter {         // 참조 타입
  var count = 0
  func increase() { count += 1 }
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) 클로저와 map / filter</h3>
        <p>클로저는 &quot;이름 없는 함수&quot;예요(JS의 화살표 함수). 마지막 인자가 클로저면 괄호 밖으로 뺄 수 있어요.</p>
        <pre className={styles.code}><code>{`let nums = [1, 2, 3, 4]
let doubled = nums.map { $0 * 2 }          // [2, 4, 6, 8]
let evens   = nums.filter { n in n % 2 == 0 } // [2, 4]
let sum     = nums.reduce(0, +)             // 10

// JS:  nums.map(n => n * 2)`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>5) enum + switch, protocol</h3>
        <p>
          Swift의 enum은 값(연관값)을 담을 수 있고, switch는 <b>모든 경우를 다 처리해야</b> 컴파일돼요. 빠뜨린 경우를 컴파일러가 알려 줍니다.
          protocol은 &quot;이런 기능을 꼭 가져야 해&quot;라는 약속(TS의 interface)입니다.
        </p>
        <pre className={styles.code}><code>{`enum LoadState {
  case loading
  case success(data: [String])
  case failure(message: String)
}

switch state {
case .loading:             print("로딩 중…")
case .success(let data):   print("\\(data.count)개")
case .failure(let msg):    print("에러: \\(msg)")
}

protocol Greetable { func greet() -> String }
struct Dog: Greetable { func greet() -> String { "멍멍" } }`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>6) SwiftUI와 @State — React와 닮은 점</h3>
        <p>
          SwiftUI는 React처럼 &quot;상태가 바뀌면 화면을 다시 그린다&quot;는 선언형 UI예요. 아래 두 코드를 비교해 보세요.
        </p>
        <div className={lab.compare}>
          <pre className={styles.code}><code>{`// SwiftUI
struct CounterView: View {
  @State private var count = 0

  var body: some View {
    VStack {
      Text("count: \\(count)")
      Button("+1") { count += 1 }
    }
  }
}`}</code></pre>
          <pre className={styles.code}><code>{`// React
function CounterView() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h3>7) 실습</h3>
        <p>코드를 읽고 결과를 맞혀 보세요. 고르면 바로 해설이 나와요.</p>
        <Quiz questions={QUIZ} />
        <PracticeBox
          title="Swift → JS 번역 연습장"
          initialCode={TRANSLATE_PRACTICE}
          hint="nickname을 'Park'으로 바꾸거나, 점수 기준을 80으로 바꿔서 결과가 어떻게 달라지는지 보세요."
        />
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
