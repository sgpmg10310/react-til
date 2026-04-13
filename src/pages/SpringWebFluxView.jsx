import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SpringWebfluxView.module.css';

export default function SpringWebfluxView() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚡ Spring WebFlux & Project Reactor</h1>
        <p className={styles.desc}>
          비동기 논블로킹(Asynchronous Non-blocking) 스트림 처리를 위한 리액티브 프로그래밍의 핵심 개념과 예제입니다. (projectreactor.io 기준)
        </p>
      </div>

      <div className={styles.card}>
        <h3>1. 리액티브 프로그래밍 (Reactive Programming) 이란?</h3>
        <p>
          데이터가 발생하는 즉시(스트림) 반응하여 처리하는 프로그래밍 패러다임입니다. 스레드가 차단(Blocking)되지 않으므로, 적은 수의 스레드로도 대규모 트래픽을 효율적으로 처리할 수 있습니다.
        </p>
      </div>

      <div className={styles.card}>
        <h3>2. Flux (0 ~ N개의 데이터 스트림)</h3>
        <p>
          <code>Flux&lt;T&gt;</code>는 <strong>0개부터 무한개</strong>까지의 데이터를 발행할 수 있는 리액티브 퍼블리셔(Publisher)입니다.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`import reactor.core.publisher.Flux;

// 1, 2, 3을 순차적으로 발행하는 Flux 생성
Flux<Integer> numbers = Flux.just(1, 2, 3);

numbers.subscribe(
    data -> System.out.println("데이터 수신: " + data),
    error -> System.err.println("에러 발생: " + error),
    () -> System.out.println("발행 완료!")
);`}</code>
        </pre>
      </div>

      <div className={styles.card}>
        <h3>3. Mono (0 ~ 1개의 데이터)</h3>
        <p>
          <code>Mono&lt;T&gt;</code>는 <strong>최대 1개</strong>의 데이터만 발행하는 퍼블리셔입니다. HTTP 요청/응답처럼 단일 결과값이 필요한 경우 주로 사용됩니다.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`import reactor.core.publisher.Mono;

// 단일 데이터를 발행하는 Mono 생성
Mono<String> greeting = Mono.just("Hello WebFlux!");

greeting.subscribe(System.out::println);`}</code>
        </pre>
      </div>

      <div className={styles.card}>
        <h3>4. 마블 다이어그램 (Marble Diagram)</h3>
        <p>
          마블 다이어그램은 시간이 지남에 따라 데이터(구슬)가 어떻게 흐르고 연산자를 거쳐 변환되는지 시각적으로 표현한 그림입니다.
        </p>
        <div className={styles.marbleTimeline}>
          <div className={styles.marbleLine}></div>
          <div className={styles.marble}>1</div>
          <div className={styles.marbleLine}></div>
          <div className={styles.marble}>2</div>
          <div className={styles.marbleLine}></div>
          <div className={styles.marble}>3</div>
          <div className={styles.marbleLine}></div>
          <div className={styles.marbleEnd}>|</div>
        </div>
        <p className={styles.caption}>▲ 시간에 따른 Flux의 데이터(1, 2, 3) 흐름과 종료(|) 시점</p>
      </div>

      <div className={styles.card}>
        <h3>5. 주요 연산자 (Operators) 활용</h3>
        <p>스트림을 구독(subscribe)하기 전에 데이터를 조작하거나 필터링할 수 있습니다.</p>
        <pre className={styles.codeBlock}>
          <code>{`Flux.range(1, 5) // 1부터 5까지 발행
    .filter(n -> n % 2 == 0) // 짝수만 필터링 (2, 4)
    .map(n -> n * 10) // 10을 곱함 (20, 40)
    .subscribe(System.out::println);`}</code>
        </pre>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/spring')} className={styles.backBtn}>
          ⬅️ Spring 허브로 돌아가기
        </button>
      </div>
    </div>
  );
}