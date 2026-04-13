import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringRestApiView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔌 2. REST API 기본 문법 예제</h1>
        <p className={styles.description}>Spring Boot의 가장 기본적인 컨트롤러 작성법을 알아봅니다.</p>
      </header>

      <section className={styles.section}>
        <h3>컨트롤러 형태 예제</h3>
        <p>웹 요청을 받고 응답하는 기본 형태입니다.</p>
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

      <Link to="/spring" className={styles.backLink}>← Spring 학습 허브로 돌아가기</Link>
    </div>
  );
}