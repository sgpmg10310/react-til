// useState: 컴포넌트의 상태(데이터)를 관리하기 위한 React의 기본 Hook(훅)입니다.
// Hook은 함수 컴포넌트에서 React의 기능들을 "연결"하여 사용할 수 있게 해주는 특별한 함수입니다.
import { useState } from 'react';

// useNavigate: react-router-dom 라이브러리에서 제공하는 Hook으로, 코드 내에서 특정 경로로 페이지를 이동시킬 때 사용합니다.
import { useNavigate } from 'react-router-dom';

// 자식 컴포넌트들을 불러옵니다.
import CustomEditor from './CustomEditor';
import LikeButton from './LikeButton';

// CSS Modules: '.module.css' 확장자를 가진 CSS 파일을 불러오면,
// 해당 파일의 클래스 이름들이 고유한 값으로 변환되어 객체 형태로(styles) 들어옵니다.
// 이를 통해 컴포넌트별로 스타일이 충돌하는 것을 방지할 수 있습니다. (Vue의 <style scoped>와 유사)
import styles from './ComponentTestView.module.css';

// 'ComponentTestView'라는 이름의 함수형 컴포넌트를 정의하고 외부에서 사용할 수 있도록 export 합니다.
export default function ComponentTestView() {
  // useNavigate Hook을 호출하여 페이지 이동 함수(navigate)를 생성합니다.
  const navigate = useNavigate();
  
  // 1. 'useState' Hook을 사용한 상태(State) 관리
  // useState는 [현재 상태 값, 상태를 변경하는 함수] 형태의 배열을 반환합니다.
  // Vue의 <script setup> 안에 선언된 ref()나 reactive()와 비슷한 역할을 합니다.
  // 'postTitle'은 상태 값(데이터), 'setPostTitle'은 이 값을 변경할 수 있는 함수입니다.
  // useState('초기 제목입니다')는 postTitle의 초기값을 설정합니다.
  const [postTitle, setPostTitle] = useState('초기 제목입니다');
  const [postContent, setPostContent] = useState('초기 내용입니다');

  // 2. 자식 컴포넌트와 상호작용하기 위한 상태 및 콜백 함수
  const [totalLikes, setTotalLikes] = useState(0);

  // 자식 컴포넌트(LikeButton)에서 호출될 콜백(callback) 함수입니다.
  // React에서는 부모가 자식에게 함수 자체를 Props로 전달하여, 자식이 그 함수를 실행하는 방식으로 통신합니다. (Vue의 emit과 유사)
  const handleAddLike = (name) => {
    // setTotalLikes와 같은 상태 변경 함수는 이전 상태 값을 기반으로 새 상태를 계산할 수 있습니다.
    // (prev => prev + 1)은 비동기적으로 상태가 업데이트될 때 발생할 수 있는 문제를 방지하는 안전한 방법입니다.
    setTotalLikes(prev => prev + 1);
    alert(`${name}님의 게시물에 좋아요를 눌렀습니다!`);
  };

  return (
    // JSX 문법: JavaScript 파일 안에서 HTML과 유사한 코드를 작성할 수 있게 해줍니다.
    // className={styles.studyContainer} 처럼 CSS Modules에서 가져온 클래스를 적용합니다.
    <div className={styles.studyContainer}>
      <h2 className={styles.title}>🧩 컴포넌트 통신 테스트</h2>
      <p className={styles.desc}>다중 State 바인딩과 Props/Callback을 테스트하는 페이지입니다.</p>

      <div className={styles.card}>
        <h3>1. 한 컴포넌트에서 2개의 상태(State) 사용하기</h3>
        <CustomEditor 
          // Props(프로퍼티): 부모 컴포넌트가 자식 컴포넌트에게 데이터를 전달하는 방법입니다.
          // title, onTitleChange, content, onContentChange 라는 이름으로 값을 전달합니다.
          title={postTitle} 
          onTitleChange={setPostTitle}
          content={postContent}
          onContentChange={setPostContent}
        />
        <div className={styles.resultBox}>
          <p><strong>입력된 제목:</strong> {postTitle}</p>
          <p><strong>입력된 내용:</strong> {postContent}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3>2. Props & Callback 예제</h3>
        <LikeButton 
          // 'username'과 'likes'는 데이터를 자식에게 내려주는 일반적인 Props입니다.
          username="프론트엔드개발자" 
          likes={totalLikes}
          // 'onAddLike'은 함수를 자식에게 내려주는 콜백 Props입니다.
          // 자식 컴포넌트(LikeButton)는 이 함수를 실행하여 부모의 상태(totalLikes)를 변경할 수 있습니다.
          onAddLike={handleAddLike}
        />
      </div>

      {/* onClick 이벤트 핸들러: 버튼이 클릭될 때 실행될 함수를 지정합니다. */}
      {/* 여기서는 navigate 함수를 호출하여 '/about' 경로로 페이지를 이동시킵니다. */}
      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}