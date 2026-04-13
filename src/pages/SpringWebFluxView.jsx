import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringWebFluxView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>⚡ 4. WebFlux와 마블 다이어그램 (Reactive)</h1>
        <p className={styles.description}>비동기 논블로킹 방식의 리액티브 프로그래밍에 대해 알아봅니다.</p>
      </header>

      <section className={styles.section}>
        <h3>WebFlux와 리액티브 스트림</h3>
        <p><strong>Spring WebFlux</strong>는 비동기 논블로킹(Non-blocking) 방식의 리액티브 웹 프레임워크로, 적은 스레드로 대량의 동시 요청을 처리할 때 유리합니다.</p>
        <p><strong>마블 다이어그램(Marble Diagram)</strong>은 리액티브 스트림(Mono, Flux)의 데이터 흐름과 연산자(Operator)의 동작을 시간 순서대로 시각화한 그림입니다. 동그란 구슬(마블)이 시간 축을 따라 흘러가는 모양으로 비동기 데이터 파이프라인을 쉽게 이해할 수 있습니다.</p>
        <pre className={styles.code}><code>{`@RestController
@RequestMapping("/reactive")
public class WebFluxController {

  // 단일 값을 반환할 때는 Mono를 사용합니다.
  @GetMapping("/mono")
  public Mono<String> getMono() {
    return Mono.just("Hello WebFlux!");
  }

  // 여러 값을 반환할 때는 Flux를 사용합니다.
  @GetMapping("/flux")
  public Flux<Integer> getFlux() {
    return Flux.just(1, 2, 3)
               .map(n -> n * 10); // 마블 다이어그램의 변환(map) 연산 표현
  }
}`}</code></pre>
      </section>

      <Link to="/spring" className={styles.backLink}>← Spring 학습 허브로 돌아가기</Link>
    </div>
  );
}