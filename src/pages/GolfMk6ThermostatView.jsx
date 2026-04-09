import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function GolfMk6ThermostatView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🚗 폭스바겐 골프 MK6 써모스탯 정비 페이지</h1>
        <p className={styles.description}>
          일상 테마 정비 노트 페이지입니다. 써모스탯 교체 절차를 중심으로 정리했고,
          실제 작업 전 차량 연식/엔진 코드에 맞는 부품 번호 확인이 필요합니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 증상 체크</li>
          <li>2. 준비물</li>
          <li>3. 교체 절차</li>
          <li>4. 작업 후 점검</li>
          <li>5. 나중에 추가할 내용</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 증상 체크</h3>
        <p>- 냉각수 온도 게이지가 비정상적으로 낮거나 출렁임</p>
        <p>- 히터가 약하고 겨울철 실내 난방이 늦음</p>
        <p>- 냉각팬 동작이 잦아지거나 엔진 경고등 점등</p>
      </section>

      <section className={styles.section}>
        <h3>2) 준비물</h3>
        <p>- 써모스탯 하우징 어셈블리(차대번호 기준 호환품)</p>
        <p>- 냉각수(G13/G12evo 규격 확인), O-ring/가스켓</p>
        <p>- 토크렌치, 소켓, 호스 클램프 플라이어, 드레인 팬</p>
      </section>

      <section className={styles.section}>
        <h3>3) 교체 절차 (요약)</h3>
        <pre className={styles.code}><code>{`1) 엔진을 완전히 식힌 후 배터리 음극 단자 분리
2) 언더커버 제거 후 냉각수 일부 배출
3) 써모스탯 하우징 주변 호스/커넥터 분리
4) 하우징 고정 볼트 제거 후 신품으로 교체
5) 규정 토크로 체결하고 호스/커넥터 재조립
6) 냉각수 보충 후 에어빼기(bleeding) 수행`}</code></pre>
        <p>주의: 알루미늄 하우징/볼트는 과토크 시 파손 위험이 있어 규정 토크를 지켜야 합니다.</p>
      </section>

      <section className={styles.section}>
        <h3>4) 작업 후 점검</h3>
        <p>- 누수 여부(하우징 결합부, 호스 조인트)</p>
        <p>- 진단기로 냉각수 온도 정상 범위 확인</p>
        <p>- 시운전 후 냉각수 레벨 재확인 및 보충</p>
      </section>

      <section className={styles.section}>
        <h3>5) 나중에 추가할 내용</h3>
        <p>- 엔진 코드별 부품 번호 정리</p>
        <p>- 작업 사진/체결 토크 표</p>
        <p>- 공임/부품비 기록과 유지보수 이력</p>
      </section>

      <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
    </div>
  );
}
