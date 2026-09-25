import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';
import lab from '../components/study/StudyLab.module.css';
import PracticeBox from '../components/study/PracticeBox.jsx';
import Quiz from '../components/study/Quiz.jsx';

const BOX_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

const QUIZ = [
  {
    q: 'React Native에서 <View> 안의 자식들은 기본으로 어느 방향으로 쌓일까요?',
    options: ['가로(row)', '세로(column)', '겹쳐서(absolute)'],
    answer: 1,
    why: '웹 CSS의 flex 기본값은 row지만, React Native는 폰 화면이 세로로 길어서 기본값이 column이에요.',
  },
  {
    q: 'React Native에서 글자를 화면에 보여 주려면?',
    code: '<View>안녕</View>',
    options: ['이대로 괜찮다', '<Text>로 감싸야 한다', '<p>로 감싸야 한다'],
    answer: 1,
    why: '글자는 반드시 <Text> 안에 있어야 해요. <View>에 글자를 바로 넣으면 에러가 납니다. <p>, <div> 같은 HTML 태그는 없어요.',
  },
  {
    q: '1000개짜리 긴 목록을 보여 줄 때 가장 알맞은 것은?',
    options: ['ScrollView + map', 'FlatList', 'div + overflow'],
    answer: 1,
    why: 'FlatList는 화면에 보이는 것만 그려서(가상화) 메모리를 아껴요. ScrollView는 1000개를 한꺼번에 다 그립니다.',
  },
  {
    q: 'style={{ width: 100 }} 에서 100의 단위는?',
    options: ['px', '밀도 독립 픽셀(dp/pt)', '%'],
    answer: 1,
    why: '단위를 쓰지 않아요. 기기 화면 밀도에 맞춰 자동으로 크기가 조절되는 논리 픽셀입니다.',
  },
  {
    q: 'useState, useEffect 같은 Hooks를 React Native에서도 쓸 수 있을까요?',
    options: ['쓸 수 있다', '쓸 수 없다', 'class 컴포넌트에서만 된다'],
    answer: 0,
    why: 'React Native는 "React + 네이티브 부품"이라 Hooks·상태관리(Zustand, React Query 등) 지식이 그대로 통해요.',
  },
];

const STYLE_PRACTICE = `// React Native의 StyleSheet는 "그냥 JS 객체"예요.
// 웹 CSS와 다른 점을 코드로 확인해 봅시다.

const StyleSheet = { create: (s) => s }; // 흉내 (진짜 RN에선 import)

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },          // 단위 없음!
  title: { fontSize: 20, fontWeight: 'bold' },   // camelCase
  row: { flexDirection: 'row', gap: 8 },
});

// 여러 스타일 합치기: 배열로 넘기면 뒤에 있는 게 이김
function flatten(styleArray) {
  return Object.assign({}, ...styleArray.filter(Boolean));
}

const isActive = true;
console.log(flatten([styles.title, isActive && { color: 'tomato' }]));

// 🧪 도전: isActive를 false로 바꾸면 color가 어떻게 될까요?
`;

function FlexSimulator() {
  const [direction, setDirection] = useState('column');
  const [justify, setJustify] = useState('flex-start');
  const [align, setAlign] = useState('stretch');
  const [count, setCount] = useState(3);

  const code = `<View style={{
  flex: 1,
  flexDirection: '${direction}',
  justifyContent: '${justify}',
  alignItems: '${align}',
}}>
${Array.from({ length: count }, (_, i) => `  <View style={styles.box}><Text>${i + 1}</Text></View>`).join('\n')}
</View>`;

  return (
    <div className={lab.demoGrid}>
      <div>
        <div className={lab.phone} aria-label="React Native 화면 미리보기">
          <div className={lab.phoneBar}>9:41 📶 🔋</div>
          <div
            className={lab.phoneScreen}
            style={{ flexDirection: direction, justifyContent: justify, alignItems: align }}
          >
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className={lab.rnBox} style={{ background: BOX_COLORS[i] }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className={lab.row}>
          flexDirection
          <select className={lab.select} value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="column">column (RN 기본값)</option>
            <option value="row">row (웹 기본값)</option>
            <option value="column-reverse">column-reverse</option>
            <option value="row-reverse">row-reverse</option>
          </select>
        </label>
        <label className={lab.row}>
          justifyContent (주축)
          <select className={lab.select} value={justify} onChange={(e) => setJustify(e.target.value)}>
            {['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className={lab.row}>
          alignItems (교차축)
          <select className={lab.select} value={align} onChange={(e) => setAlign(e.target.value)}>
            {['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (
              <option key={v} value={v}>{v}{v === 'stretch' ? ' (기본값)' : ''}</option>
            ))}
          </select>
        </label>
        <div className={lab.row}>
          상자 개수
          <button type="button" className={`${lab.btn} ${lab.btnGhost}`} onClick={() => setCount((c) => Math.max(1, c - 1))}>−</button>
          <b>{count}</b>
          <button type="button" className={`${lab.btn} ${lab.btnGhost}`} onClick={() => setCount((c) => Math.min(5, c + 1))}>+</button>
        </div>
        <pre className={lab.miniCode}><code>{code}</code></pre>
      </div>
    </div>
  );
}

export default function ReactNativeView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>📱 React Native 기초</h1>
        <p className={styles.description}>
          React Native는 <b>React 문법 그대로 진짜 iPhone·Android 앱</b>을 만드는 도구예요.
          웹 React는 &lt;div&gt;를 브라우저에 그리고, React Native는 &lt;View&gt;를 폰의 진짜 네이티브 부품(iOS UIView, Android View)으로 바꿔 그립니다.
          즉 &quot;생각하는 방법(컴포넌트·Hooks·상태)&quot;은 같고 &quot;그리는 부품&quot;만 달라요.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 동작 원리: JS가 네이티브 화면을 그리는 방법</li>
          <li>2. 웹 태그 ↔ RN 컴포넌트 대응표</li>
          <li>3. StyleSheet와 Flexbox (📱 폰 시뮬레이터)</li>
          <li>4. FlatList로 긴 목록 그리기</li>
          <li>5. Platform 분기와 Expo로 시작하기</li>
          <li>6. 실습: 퀴즈 + StyleSheet 연습장</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 동작 원리</h3>
        <p>
          우리가 쓴 JS 코드는 폰 안의 JS 엔진(Hermes)에서 돌아가요. React가 &quot;화면을 이렇게 바꿔 줘&quot;라고 결정하면,
          새 구조(New Architecture)의 <b>JSI</b>라는 통로로 네이티브 쪽에 바로 전달되고, <b>Fabric</b>이라는 렌더러가 진짜 네이티브 화면을 그립니다.
        </p>
        <div className={lab.pipeline}>
          <span className={lab.pipeStep}>내 JSX 코드</span><span className={lab.pipeArrow}>→</span>
          <span className={lab.pipeStep}>React (무엇이 바뀌었나 계산)</span><span className={lab.pipeArrow}>→</span>
          <span className={lab.pipeStep}>JSI 통로</span><span className={lab.pipeArrow}>→</span>
          <span className={lab.pipeStep}>Fabric → iOS/Android 진짜 화면</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3>2) 웹 태그 ↔ RN 컴포넌트 대응표</h3>
        <div className={lab.tableWrap}>
          <table className={lab.table}>
            <thead>
              <tr><th>웹 (react-dom)</th><th>React Native</th><th>기억할 점</th></tr>
            </thead>
            <tbody>
              <tr><td>&lt;div&gt;</td><td>&lt;View&gt;</td><td>기본 flexDirection이 column</td></tr>
              <tr><td>&lt;p&gt;, &lt;span&gt;</td><td>&lt;Text&gt;</td><td>글자는 무조건 Text 안에</td></tr>
              <tr><td>&lt;img&gt;</td><td>&lt;Image&gt;</td><td>원격 이미지는 크기(width/height) 필수</td></tr>
              <tr><td>&lt;input&gt;</td><td>&lt;TextInput&gt;</td><td>onChange 대신 onChangeText(글자만 받음)</td></tr>
              <tr><td>&lt;button onClick&gt;</td><td>&lt;Pressable onPress&gt;</td><td>click이 아니라 press</td></tr>
              <tr><td>overflow: scroll</td><td>&lt;ScrollView&gt; / &lt;FlatList&gt;</td><td>스크롤은 컴포넌트로</td></tr>
              <tr><td>CSS 파일, className</td><td>StyleSheet.create / style</td><td>camelCase, 단위 없음, 상속 거의 없음</td></tr>
            </tbody>
          </table>
        </div>
        <pre className={styles.code}><code>{`import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function Hello() {
  const [name, setName] = useState('');
  return (
    <View style={styles.container}>
      <TextInput value={name} onChangeText={setName} placeholder="이름" style={styles.input} />
      <Pressable onPress={() => alert(\`안녕, \${name}\`)} style={styles.button}>
        <Text style={styles.buttonText}>인사하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) StyleSheet와 Flexbox — 📱 폰 시뮬레이터</h3>
        <p>
          RN 레이아웃은 거의 전부 Flexbox예요. 가장 많이 헷갈리는 건 <b>기본 방향이 세로(column)</b>라는 점!
          그래서 justifyContent는 &quot;세로&quot;, alignItems는 &quot;가로&quot; 정렬이 됩니다. 아래에서 값을 바꿔 보세요.
        </p>
        <FlexSimulator />
      </section>

      <section className={styles.section}>
        <h3>4) FlatList로 긴 목록 그리기</h3>
        <p>
          웹처럼 <code>items.map()</code>으로 1000개를 그리면 폰이 느려져요. FlatList는 화면에 보이는 것 + 조금만 그리고,
          스크롤하면 재활용합니다. 끝에 닿으면 onEndReached로 다음 페이지를 불러와요(무한 스크롤).
        </p>
        <pre className={styles.code}><code>{`<FlatList
  data={todos}                                  // 배열
  keyExtractor={(item) => String(item.id)}      // key 역할
  renderItem={({ item }) => <Text>{item.title}</Text>}
  onEndReached={fetchNextPage}                  // 끝에 닿으면
  onEndReachedThreshold={0.5}
  refreshing={isRefreshing}
  onRefresh={refetch}                           // 당겨서 새로고침
/>`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>5) Platform 분기와 Expo로 시작하기</h3>
        <p>iOS와 Android에서 조금 다르게 하고 싶을 때는 Platform을 씁니다. 처음 시작은 Expo가 가장 쉬워요.</p>
        <pre className={styles.code}><code>{`import { Platform } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    ...Platform.select({
      ios: { shadowOpacity: 0.2 },
      android: { elevation: 4 },   // 안드로이드 그림자
    }),
  },
});

// 새 프로젝트 만들기 (터미널)
// npx create-expo-app@latest my-app
// cd my-app && npx expo start   → 폰의 Expo Go 앱으로 QR 스캔하면 바로 실행!`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>6) 실습</h3>
        <Quiz questions={QUIZ} />
        <PracticeBox
          title="StyleSheet 합치기 연습장"
          initialCode={STYLE_PRACTICE}
          hint="RN은 style={[a, b]}처럼 배열을 받아요. 뒤에 있는 스타일이 앞의 같은 속성을 덮어씁니다."
        />
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
