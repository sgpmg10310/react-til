import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function GitAdvancedPlaybookView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌿 Git 실무 플레이북 (Merge / Rebase / Reset)</h1>
        <p className={styles.description}>
          실무에서 자주 맞닥뜨리는 브랜치 작업 상황을 케이스별로 정리했습니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 기능 브랜치 병합: merge</li>
          <li>2. 히스토리 정리: rebase</li>
          <li>3. stage 해제: git reset HEAD</li>
          <li>4. 커밋 되돌리기: reset vs revert</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 기능 브랜치 병합 (merge)</h3>
        <p>공유 브랜치에서 가장 안전한 기본 방식입니다. 히스토리를 보존합니다.</p>
        <pre className={styles.code}><code>{`git checkout main
git pull origin main
git checkout feature/login
git merge main          # 최신 main 반영
git checkout main
git merge feature/login # 기능 브랜치 병합`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) 히스토리 선형화 (rebase)</h3>
        <p>내 브랜치 커밋을 최신 main 뒤로 옮겨 깔끔한 히스토리를 만듭니다.</p>
        <pre className={styles.code}><code>{`git checkout feature/login
git fetch origin
git rebase origin/main
# 충돌 나면 수정 후:
git add .
git rebase --continue`}</code></pre>
        <p>주의: 이미 공유된 브랜치 재작성 시 팀과 합의가 필요합니다.</p>
      </section>

      <section className={styles.section}>
        <h3>3) 잘못 올린 파일 stage 해제 (`git reset HEAD`)</h3>
        <p>파일 변경 내용은 유지하고, staging area에서만 내릴 때 사용합니다.</p>
        <pre className={styles.code}><code>{`git add .
git reset HEAD src/secrets.txt
# 또는
git restore --staged src/secrets.txt`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) 커밋 되돌리기: reset vs revert</h3>
        <p><strong>로컬 정리</strong>: 아직 push 전이면 `git reset --soft HEAD~1`</p>
        <p><strong>공유 브랜치</strong>: 이미 push 후라면 `git revert &lt;commit&gt;` 권장</p>
        <pre className={styles.code}><code>{`# push 전: 커밋만 취소, 변경은 유지
git reset --soft HEAD~1

# push 후: 이력 보존하며 취소 커밋 생성
git revert a1b2c3d`}</code></pre>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
