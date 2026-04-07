import { useNavigate, Link } from 'react-router-dom';
import styles from './HomeView.module.css';

export default function HomeView() {
  const navigate = useNavigate();

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
      </div>
    </div>
  );
}