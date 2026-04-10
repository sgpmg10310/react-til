import { useNavigate, Link } from 'react-router-dom';
import styles from './HomeView.module.css';

export default function HomeView() {
  const navigate = useNavigate();
  const studyTopics = [
    {
      title: 'TypeScript',
      emoji: '🔷',
      summary: '정적 타입으로 런타임 에러를 줄입니다.',
      path: '/typescript',
      colorClass: styles.tsButton,
    },
    {
      title: 'Next.js',
      emoji: '⚫',
      summary: '파일 기반 라우팅 + 서버 컴포넌트 기반 React 프레임워크.',
      path: '/nextjs',
      colorClass: styles.nextButton,
    },
    {
      title: 'Nuxt.js',
      emoji: '💚',
      summary: 'Vue 기반 풀스택 프레임워크로 SSR/SSG를 지원합니다.',
      path: '/nuxtjs',
      colorClass: styles.nuxtButton,
    },
    {
      title: 'Spring',
      emoji: '🌱',
      summary: 'Java 기반 서버 개발 표준 프레임워크입니다.',
      path: '/spring',
      colorClass: styles.springButton,
    },
    {
      title: '자동차 정비',
      emoji: '🚗',
      summary: '폭스바겐 골프 MK6 써모스탯 교체 가이드 (계속 업데이트 예정)',
      path: '/golf-mk6-thermostat',
      colorClass: styles.autoButton,
    },
    {
      title: '프론트엔드 방법론',
      emoji: '📐',
      summary: '실무 개발 프로세스/하네스 예제',
      path: '/frontend-methodology',
      colorClass: styles.methodButton,
    },
    {
      title: '프론트엔드 기본 스킬',
      emoji: '✅',
      summary: '기초 역량 로드맵과 실전 체크포인트',
      path: '/frontend-basic-skills',
      colorClass: styles.skillButton,
    },
  ];
  const newExamples = [
    { title: 'Git 실무 케이스', path: '/git-advanced-playbook', emoji: '🌿' },
    { title: 'Spring AI + MCP/Tools', path: '/spring-ai-mcp-tools', emoji: '🤖' },
    { title: 'Firebase 프론트 구축', path: '/firebase-frontend-boot', emoji: '🔥' },
    { title: '무한 스크롤 + 새로고침', path: '/infinite-scroll-refresh-lab', emoji: '∞' },
  ];
  const frontendDocs = [
    { name: 'React Docs', url: 'https://react.dev/' },
    { name: 'Vue Docs', url: 'https://vuejs.org/' },
    { name: 'Next.js Docs', url: 'https://nextjs.org/docs' },
    { name: 'Nuxt Docs', url: 'https://nuxt.com/docs' },
    { name: 'TypeScript Docs', url: 'https://www.typescriptlang.org/docs/' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
  ];
  const backendDocs = [
    { name: 'Spring Docs', url: 'https://docs.spring.io/spring-framework/reference/' },
    { name: 'Spring Boot Docs', url: 'https://docs.spring.io/spring-boot/index.html' },
    { name: 'Node.js Docs', url: 'https://nodejs.org/docs/latest/api/' },
    { name: 'Express Docs', url: 'https://expressjs.com/' },
    { name: 'NestJS Docs', url: 'https://docs.nestjs.com/' },
    { name: 'FastAPI Docs', url: 'https://fastapi.tiangolo.com/' },
  ];
  const openSourceLinks = [
    { name: 'React', url: 'https://github.com/facebook/react' },
    { name: 'Vue', url: 'https://github.com/vuejs/core' },
    { name: 'Next.js', url: 'https://github.com/vercel/next.js' },
    { name: 'Nuxt', url: 'https://github.com/nuxt/nuxt' },
    { name: 'Spring Boot', url: 'https://github.com/spring-projects/spring-boot' },
    { name: 'TanStack Query', url: 'https://github.com/TanStack/query' },
  ];
  const frontendPatterns = [
    {
      title: '1) Container/Presentational 분리',
      reason: 'UI 렌더링(Presentational)과 데이터/비즈니스 로직(Container)을 분리하여 컴포넌트 재사용성과 테스트 용이성을 높입니다.',
      code: `function UserContainer() {
  const users = useUsers();
  return <UserList users={users} />;
}`,
    },
    {
      title: '2) Custom Hook 추출',
      reason: '상태 관리와 관련된 UI 로직을 독립적인 함수로 빼내어 여러 컴포넌트에서 중복 없이 재사용하기 위함입니다.',
      code: `function useToggle(initial = false) {
  const [open, setOpen] = useState(initial);
  return { open, toggle: () => setOpen(v => !v) };
}`,
    },
    {
      title: '3) Server State는 React Query',
      reason: '서버 데이터의 캐싱, 로딩 상태, 에러 처리, 동기화 등을 직접 구현하지 않고 표준화하여 코드의 복잡도를 크게 줄여줍니다.',
      code: `const { data, isLoading, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});`,
    },
    {
      title: '4) Optimistic Update',
      reason: '서버 응답을 기다리지 않고 미리 UI를 업데이트하여 사용자에게 매우 빠른 반응성을 제공하기 위함입니다.',
      code: `const mutation = useMutation({
  mutationFn: createPost,
  onMutate: async newPost => queryClient.setQueryData(['posts'], old => [newPost, ...(old || [])]),
});`,
    },
    {
      title: '5) Error Boundary',
      reason: '하위 컴포넌트에서 발생한 에러로 인해 앱 전체가 하얗게 죽는 것(Crash)을 막고, 우아하게 에러 UI를 보여주기 위해 사용합니다.',
      code: `<ErrorBoundary fallback={<p>문제가 발생했습니다.</p>}>
  <App />
</ErrorBoundary>`,
    },
    {
      title: '6) Suspense + Lazy',
      reason: '컴포넌트를 처음에 모두 불러오지 않고, 필요할 때만 비동기로 불러와(Lazy) 초기 로딩 속도를 최적화합니다.',
      code: `const Dashboard = lazy(() => import('./Dashboard'));
<Suspense fallback={<Spinner />}><Dashboard /></Suspense>;`,
    },
    {
      title: '7) 접근성 우선 폼',
      reason: '스크린 리더 등 보조 기기를 사용하는 사용자도 폼을 쉽게 이해하고 조작할 수 있도록 웹 접근성(A11y)을 준수하기 위함입니다.',
      code: `<label htmlFor="email">이메일</label>
<input id="email" aria-invalid={hasError} />`,
    },
    {
      title: '8) 상태 최소화(derived state)',
      reason: '기존 상태들로 충분히 계산할 수 있는 값을 굳이 새로운 상태(useState)로 만들지 않아 데이터 동기화 버그를 원천 차단합니다.',
      code: `const completedCount = todos.filter(todo => todo.done).length;`,
    },
    {
      title: '9) 불변 업데이트',
      reason: 'React가 상태 변화를 얕은 비교(Shallow Compare)로 빠르게 감지하고 리렌더링할 수 있도록 원본 데이터를 수정하지 않고 새 객체를 만듭니다.',
      code: `setItems(prev => prev.map(item =>
  item.id === id ? { ...item, done: true } : item
));`,
    },
    {
      title: '10) Feature 폴더 구조',
      reason: '프로젝트가 커졌을 때 관련 있는 기능(Feature)끼리 모아두어, 코드를 찾기 쉽고 모듈 간 결합도를 낮추기 위함입니다.',
      code: `features/
  auth/
    components/
    hooks/
    api/`,
    },
  ];

  const javaPatterns = [
    {
      title: '1) Singleton (싱글톤)',
      reason: '애플리케이션 전체에서 단 하나의 객체 인스턴스만 생성하여 자원을 공유하는 패턴입니다. DB 커넥션 풀, 설정 객체 등에 주로 사용됩니다.',
      code: `public class Singleton {
  private static Singleton instance;
  private Singleton() {} // 외부 생성 방지
  
  public static Singleton getInstance() {
    if (instance == null) {
      instance = new Singleton();
    }
    return instance;
  }
}`,
    },
    {
      title: '2) Factory Method (팩토리 메서드)',
      reason: '객체 생성을 직접(new) 하지 않고, 팩토리 클래스에 위임하여 객체 간의 결합도를 낮추는 패턴입니다.',
      code: `public class AnimalFactory {
  public Animal createAnimal(String type) {
    if ("dog".equals(type)) return new Dog();
    if ("cat".equals(type)) return new Cat();
    return null;
  }
}`,
    },
    {
      title: '3) Strategy (전략 패턴)',
      reason: '런타임에 실행할 알고리즘(전략)을 교체할 수 있도록 캡슐화하는 패턴입니다. (예: 카드 결제, 카카오페이 결제 전환)',
      code: `public interface PaymentStrategy { void pay(int amount); }
public class CardPayment implements PaymentStrategy { ... }

// 사용 예시
PaymentStrategy strategy = new CardPayment();
strategy.pay(10000);`,
    },
    {
      title: '4) Observer (옵저버 패턴)',
      reason: '어떤 객체의 상태가 변할 때, 그 객체에 의존하는 다른 객체들에게 자동으로 알림을 보내는 패턴입니다. (이벤트 리스너, 구독 로직)',
      code: `public interface Observer { void update(String msg); }

public class User implements Observer {
  public void update(String msg) { 
    System.out.println("알림 수신: " + msg); 
  }
}`,
    },
    {
      title: '5) Builder (빌더 패턴)',
      reason: '생성자의 매개변수가 많을 때, 가독성 좋고 안전하게 객체를 조립(Build)하여 생성하는 패턴입니다.',
      code: `User user = new User.Builder()
    .name("홍길동")
    .age(30)
    .build();`,
    },
    {
      title: '6) Adapter (어댑터 패턴)',
      reason: '호환되지 않는 인터페이스를 가진 클래스들을 연결해 함께 작동하게 만드는 패턴입니다. (110V를 220V로 바꾸는 돼지코 역할)',
      code: `public class Adapter implements NewSystem {
  private OldSystem oldSystem;
  
  public void execute() {
    oldSystem.oldExecute(); // 기존 시스템의 메서드 호출
  }
}`,
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>React 문법, 기초부터 심화까지!</h1>
        <p className={styles.subtitle}>
          이곳에서 React의 핵심 개념들을 하나씩 정복해 보세요.
        </p>
        <button className={styles.ctaButton} onClick={() => navigate('/about')}>
          학습 시작하기 🚀
        </button>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            className={styles.ctaButton} 
            style={{ background: '#f59e0b', fontSize: '0.9rem', padding: '10px 20px' }} 
            onClick={() => navigate('/callback-test')}
          >
            🔥 초간단 useCallback 바로가기
          </button>
          <button 
            className={styles.ctaButton} 
            style={{ background: '#10b981', fontSize: '0.9rem', padding: '10px 20px' }} 
            onClick={() => navigate('/vue-syntax')}
          >
            💚 Vue 기본 문법 알아보기
          </button>
        </div>

        {/* 진단용 테스트 페이지 링크 추가 */}
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          문제가 계속되나요?{' '}
          <Link to="/test" style={{ color: '#3b82f6', fontWeight: 'bold' }}>테스트 페이지로 직접 이동</Link>
        </p>

        {/* 한글 게임 스페셜 배너 추가 */}
        <div className={styles.hangulBanner} onClick={() => navigate('/hangul-game')}>
          <div className={styles.hangulImage}>
            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Sejong&backgroundColor=b6e3f4&features=mustache" alt="웃긴 세종대왕 캐릭터" width="80" height="80" />
          </div>
          <div className={styles.hangulText}>
            <h3>👑 세종대왕님도 빵 터진 한글 게임!</h3>
            <p>자음 모음을 합치고 귀여운 그림들을 찾아보세요 🚀</p>
          </div>
        </div>

        <section className={styles.topicSection}>
          <h2 className={styles.topicTitle}>확장 학습 주제</h2>
          <p className={styles.topicSubtitle}>
            React 외 확장 주제는 여기서 바로 이동할 수 있습니다.
          </p>
          <div className={styles.topicGrid}>
            {studyTopics.map(topic => (
              <article key={topic.title} className={styles.topicCard}>
                <h3>{topic.emoji} {topic.title}</h3>
                <p>{topic.summary}</p>
                <button
                  className={`${styles.topicButton} ${topic.colorClass}`}
                  onClick={() => navigate(topic.path)}
                >
                  {topic.title} 세부 문법 보기
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.quickSection}>
          <h2 className={styles.topicTitle}>신규 예제 바로가기</h2>
          <p className={styles.topicSubtitle}>
            방금 추가한 심화 학습 예제로 바로 이동할 수 있습니다.
          </p>
          <div className={styles.quickGrid}>
            {newExamples.map(item => (
              <button
                key={item.path}
                className={styles.quickButton}
                onClick={() => navigate(item.path)}
              >
                {item.emoji} {item.title}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.topicSection}>
          <h2 className={styles.topicTitle}>공식 문서 바로가기</h2>
          <p className={styles.topicSubtitle}>프론트엔드/백엔드 기본 공식 문서 링크</p>
          <div className={styles.linkGrid}>
            {[...frontendDocs, ...backendDocs].map(doc => (
              <a key={doc.url} href={doc.url} target="_blank" rel="noreferrer" className={styles.docLink}>
                {doc.name}
              </a>
            ))}
          </div>
        </section>

        <section className={styles.quickSection}>
          <h2 className={styles.topicTitle}>오픈소스 GitHub 링크</h2>
          <div className={styles.linkGrid}>
            {openSourceLinks.map(repo => (
              <a key={repo.url} href={repo.url} target="_blank" rel="noreferrer" className={styles.docLink}>
                {repo.name} GitHub
              </a>
            ))}
          </div>
        </section>

        <section className={styles.topicSection}>
          <h2 className={styles.topicTitle}>요즘 많이 쓰는 프론트 개발 패턴 예제</h2>
          <p className={styles.topicSubtitle}>패턴 10개의 사용 이유와 핵심 소스코드</p>
          <div className={styles.patternGrid}>
            {frontendPatterns.map(pattern => (
              <article key={pattern.title} className={styles.patternCard}>
                <h3>{pattern.title}</h3>
                <p className={styles.patternDesc}>{pattern.reason}</p>
                <pre className={styles.patternCode}><code>{pattern.code}</code></pre>
              </article>
            ))}
          </div>
        </section>

        {/* 자바 디자인 패턴 (GoF) 섹션 추가 */}
        <section className={styles.topicSection}>
          <h2 className={styles.topicTitle}>☕ 자바 디자인 패턴 (GoF 핵심 요약)</h2>
          <p className={styles.topicSubtitle}>면접과 실무에 자주 나오는 GoF 디자인 패턴을 가장 쉬운 예제로 이해해 봅니다.</p>
          <div className={styles.patternGrid}>
            {javaPatterns.map(pattern => (
              <article key={pattern.title} className={styles.patternCard}>
                <h3>{pattern.title}</h3>
                <p className={styles.patternDesc}>💡 <strong>왜 쓸까?</strong><br/>{pattern.reason}</p>
                <pre className={styles.patternCode} style={{ background: '#2d3748' }}><code>{pattern.code}</code></pre>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}