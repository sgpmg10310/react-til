import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌱 Spring 세부 문법 + 프로젝트 요약</h1>
        <p className={styles.description}>
          spring.io의 Projects 페이지를 기준으로 실무에서 가장 많이 조합하는 핵심 프로젝트를
          한국어로 요약했습니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. Spring 핵심 프로젝트 한글 요약</li>
          <li>2. REST API 기본 문법 예제</li>
          <li>3. 보안/데이터/클라우드 확장 포인트</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) spring.io 핵심 프로젝트 요약</h3>
        <p><strong>Spring Boot</strong>: 기본 설정을 자동화해 빠르게 실행 가능한 앱을 만듭니다.</p>
        <p><strong>Spring Framework</strong>: DI, 트랜잭션, 웹, 데이터 접근 등 코어 기능을 제공합니다.</p>
        <p><strong>Spring Data</strong>: JPA, MongoDB 등 다양한 저장소를 일관된 방식으로 다룹니다.</p>
        <p><strong>Spring Security</strong>: 인증/인가를 표준 방식으로 적용합니다.</p>
        <p><strong>Spring Cloud</strong>: 마이크로서비스 패턴(설정, 게이트웨이, 서비스 디스커버리 등)을 지원합니다.</p>
      </section>

      <section className={styles.section}>
        <h3>2) REST API 기본 문법 예제</h3>
        <p>Spring Boot에서 가장 자주 시작하는 컨트롤러 형태입니다.</p>
        <pre className={styles.code}><code>{`@RestController
@RequestMapping("/posts")
public class PostController {

  @GetMapping
  public List<PostDto> findAll() {
    return postService.findAll();
  }

  @PostMapping
  public PostDto create(@RequestBody CreatePostRequest request) {
    return postService.create(request);
  }
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) 확장 포인트</h3>
        <p><strong>보안</strong>: Spring Security + JWT/OAuth2로 인증 체계 확장</p>
        <p><strong>데이터</strong>: Spring Data JPA로 CRUD 표준화, QueryDSL로 복잡 쿼리 처리</p>
        <p><strong>클라우드</strong>: Spring Cloud로 분산 환경 공통 문제를 모듈 단위로 해결</p>
      </section>

      <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
    </div>
  );
}
