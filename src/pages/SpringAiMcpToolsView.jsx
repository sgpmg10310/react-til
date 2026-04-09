import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringAiMcpToolsView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🤖 Spring AI + MCP + Tools + PDF Reader</h1>
        <p className={styles.description}>
          Spring AI 학습 포인트와 MCP/툴 연동, PDF 문서 리더(RAG) 패턴을 한 페이지에서 정리했습니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. Spring AI 핵심 기술</li>
          <li>2. MCP 및 Tool 활용법</li>
          <li>3. PDF Document Reader 예제</li>
          <li>4. 실무 아키텍처 팁</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) Spring AI 핵심</h3>
        <p>- `ChatClient`: 모델 호출 추상화</p>
        <p>- `EmbeddingModel` + `VectorStore`: 의미 검색(RAG)</p>
        <p>- Tool Calling: 모델이 함수/도구를 선택 호출</p>
      </section>

      <section className={styles.section}>
        <h3>2) MCP와 Tools 활용</h3>
        <p>MCP는 모델이 외부 시스템(파일, DB, API, 브라우저)에 안전하게 접근하도록 표준화한 방식입니다.</p>
        <pre className={styles.code}><code>{`// 개념 흐름
User Prompt
 -> LLM
 -> Tool 선택 (MCP tool)
 -> 외부 실행 결과 반환
 -> LLM이 최종 응답 생성`}</code></pre>
        <p>실무에서는 도구 호출 권한 범위, 감사 로그, 타임아웃 설정이 중요합니다.</p>
      </section>

      <section className={styles.section}>
        <h3>3) PDF Reader (RAG) 예제 흐름</h3>
        <pre className={styles.code}><code>{`1) PDF 텍스트 추출
2) 문서 chunk 분할
3) Embedding 생성 후 Vector DB 저장
4) 질문 시 유사 chunk 검색
5) 검색 결과 + 질문을 LLM에 전달해 답변 생성`}</code></pre>
        <pre className={styles.code}><code>{`// pseudo code
List<Document> docs = pdfReader.read("manual.pdf");
vectorStore.add(docs);

var context = vectorStore.similaritySearch("교체 주기?");
var answer = chatClient.prompt()
    .user("질문: 교체 주기?\n참고문서: " + context)
    .call()
    .content();`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) 실무 포인트</h3>
        <p>- 프롬프트 템플릿 버전관리</p>
        <p>- 민감정보 마스킹 후 임베딩</p>
        <p>- 출처 citation(문서 페이지/문단) 반환</p>
        <p>- 모델 장애 대비 fallback 모델 구성</p>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
