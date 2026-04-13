import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JsSyntax100View.module.css';

// 자바스크립트 핵심 문법 100선 데이터
const jsConcepts = [
  // --- 변수 및 데이터 타입 (1~10) ---
  { id: 1, category: '변수와 타입', title: 'var', desc: '함수 스코프 변수 선언 방식 (호이스팅 발생, 현재는 사용 지양)', code: 'var a = 1;' },
  { id: 2, category: '변수와 타입', title: 'let', desc: '블록 스코프 재할당 가능 변수 (ES6)', code: 'let b = 2;\nb = 3;' },
  { id: 3, category: '변수와 타입', title: 'const', desc: '블록 스코프 상수 (재할당 불가)', code: 'const c = 3;' },
  { id: 4, category: '변수와 타입', title: 'String', desc: '문자열 타입', code: 'let str = "Hello";' },
  { id: 5, category: '변수와 타입', title: 'Number', desc: '숫자 타입 (정수, 실수 모두 포함)', code: 'let num = 42.5;' },
  { id: 6, category: '변수와 타입', title: 'Boolean', desc: '논리적인 참/거짓 타입', code: 'let isTrue = true;' },
  { id: 7, category: '변수와 타입', title: 'Null', desc: '의도적으로 비어있는 값을 나타낼 때 사용', code: 'let empty = null;' },
  { id: 8, category: '변수와 타입', title: 'Undefined', desc: '값이 할당되지 않은 초기 상태', code: 'let notDefined;' },
  { id: 9, category: '변수와 타입', title: 'Symbol', desc: '고유하고 변경 불가능한 식별자', code: 'const sym = Symbol("id");' },
  { id: 10, category: '변수와 타입', title: 'BigInt', desc: '안전 한계를 넘어서는 큰 정수 처리', code: 'const big = 9007199254740991n;' },

  // --- 연산자 (11~25) ---
  { id: 11, category: '연산자', title: '산술 연산자', desc: '+, -, *, /, % (나머지)', code: 'let sum = 10 + 5;' },
  { id: 12, category: '연산자', title: '거듭제곱 연산자', desc: '** 를 이용해 거듭제곱을 계산', code: 'let pow = 2 ** 3; // 8' },
  { id: 13, category: '연산자', title: '증감 연산자', desc: '++, -- (전위/후위 적용 가능)', code: 'let i = 0;\ni++;' },
  { id: 14, category: '연산자', title: '동등 연산자 (==)', desc: '타입 변환 후 값이 같은지 비교', code: '1 == "1" // true' },
  { id: 15, category: '연산자', title: '일치 연산자 (===)', desc: '타입 변환 없이 값과 타입 모두 비교 (권장)', code: '1 === "1" // false' },
  { id: 16, category: '연산자', title: '비교 연산자', desc: '크기를 비교 (>, <, >=, <=)', code: '5 > 3 // true' },
  { id: 17, category: '연산자', title: '논리 AND (&&)', desc: '모든 조건이 참이면 참 반환', code: 'true && false // false' },
  { id: 18, category: '연산자', title: '논리 OR (||)', desc: '조건 중 하나라도 참이면 참 반환', code: 'true || false // true' },
  { id: 19, category: '연산자', title: '논리 NOT (!)', desc: '참/거짓을 반전시킴', code: '!true // false' },
  { id: 20, category: '연산자', title: 'Nullish 병합 (??)', desc: 'null이나 undefined일 때만 우항 반환', code: 'let a = null ?? "default";' },
  { id: 21, category: '연산자', title: '옵셔널 체이닝 (?.)', desc: '객체 속성이 없어도 에러 대신 undefined 반환', code: 'obj?.prop?.method();' },
  { id: 22, category: '연산자', title: 'typeof', desc: '값의 자료형을 문자열로 반환', code: 'typeof 42 // "number"' },
  { id: 23, category: '연산자', title: 'instanceof', desc: '객체의 프로토타입 체인에 생성자가 있는지 확인', code: '[] instanceof Array // true' },
  { id: 24, category: '연산자', title: 'delete', desc: '객체의 특정 속성을 제거', code: 'delete obj.key;' },
  { id: 25, category: '연산자', title: 'in', desc: '객체 내에 특정 속성이 존재하는지 확인', code: '"key" in obj // true' },

  // --- 제어문 (26~35) ---
  { id: 26, category: '제어문', title: 'if-else', desc: '조건식에 따른 분기 처리', code: 'if (x > 0) {\n  // 양수\n} else {\n  // 0 또는 음수\n}' },
  { id: 27, category: '제어문', title: 'switch', desc: '하나의 값을 여러 조건(case)과 비교하여 실행', code: 'switch(val) {\n  case 1: break;\n  default: break;\n}' },
  { id: 28, category: '제어문', title: '삼항 연산자', desc: '조건식 ? 참일_때 : 거짓일_때', code: 'let res = age >= 18 ? "성인" : "미성년";' },
  { id: 29, category: '제어문', title: 'for', desc: '초기화, 조건식, 증감식을 사용하는 기본 반복문', code: 'for (let i=0; i<5; i++) {}' },
  { id: 30, category: '제어문', title: 'while', desc: '조건이 참인 동안 계속 반복', code: 'while (i < 5) { i++; }' },
  { id: 31, category: '제어문', title: 'do-while', desc: '최소 한 번은 무조건 실행한 후 조건 검사', code: 'do { i++; } while(i < 5);' },
  { id: 32, category: '제어문', title: 'break', desc: '실행 중인 반복문이나 switch문을 강제 탈출', code: 'if (found) break;' },
  { id: 33, category: '제어문', title: 'continue', desc: '현재 반복을 건너뛰고 다음 반복으로 넘어감', code: 'if (skip) continue;' },
  { id: 34, category: '제어문', title: 'for...in', desc: '객체의 열거 가능한 속성(Key)을 순회', code: 'for (let key in obj) {}' },
  { id: 35, category: '제어문', title: 'for...of', desc: '이터러블(배열, 문자열 등)의 값(Value)을 순회', code: 'for (let val of arr) {}' },

  // --- 함수 (36~45) ---
  { id: 36, category: '함수', title: '함수 선언문', desc: '호이스팅이 발생하는 기본 함수 선언', code: 'function add(a, b) {\n  return a + b;\n}' },
  { id: 37, category: '함수', title: '함수 표현식', desc: '익명/기명 함수를 변수에 할당', code: 'const add = function(a, b) {};' },
  { id: 38, category: '함수', title: '화살표 함수', desc: '=> 를 사용하며, 자신만의 this를 가지지 않음', code: 'const add = (a, b) => a + b;' },
  { id: 39, category: '함수', title: 'IIFE', desc: '정의되자마자 즉시 실행되는 함수', code: '(function() {\n  // 초기화 코드\n})();' },
  { id: 40, category: '함수', title: '기본 매개변수', desc: '인자가 없을 때 사용할 기본값 설정', code: 'function greet(name = "Guest") {}' },
  { id: 41, category: '함수', title: '나머지 매개변수', desc: '여러 개의 가변 인자를 하나의 배열로 받음', code: 'function sum(...nums) {}' },
  { id: 42, category: '함수', title: 'arguments 객체', desc: '일반 함수 내부에서 전달된 모든 인자를 담은 객체', code: 'function oldFn() {\n  console.log(arguments);\n}' },
  { id: 43, category: '함수', title: '클로저 (Closure)', desc: '자신이 선언된 렉시컬 환경의 변수를 기억하는 함수', code: 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}' },
  { id: 44, category: '함수', title: '제너레이터 (*)', desc: '함수 실행을 일시 중지(yield)하고 재개할 수 있음', code: 'function* gen() {\n  yield 1;\n}' },
  { id: 45, category: '함수', title: '콜백 함수', desc: '다른 함수의 인자로 넘겨져 나중에 호출되는 함수', code: 'setTimeout(() => {\n  // 1초 뒤 실행\n}, 1000);' },

  // --- 객체 (46~55) ---
  { id: 46, category: '객체', title: '객체 리터럴', desc: '중괄호를 사용해 키-값 쌍을 저장', code: 'const user = { name: "Tom", age: 20 };' },
  { id: 47, category: '객체', title: '점/대괄호 표기법', desc: '객체 속성에 접근하는 방법', code: 'user.name;\nuser["age"];' },
  { id: 48, category: '객체', title: '메서드 축약 표현', desc: '객체 내에서 함수를 더 간결하게 선언', code: 'const obj = {\n  say() { console.log("hi"); }\n};' },
  { id: 49, category: '객체', title: '계산된 속성명', desc: '대괄호를 이용해 런타임에 동적으로 키 생성', code: 'const obj = { [propName]: "value" };' },
  { id: 50, category: '객체', title: 'Object.keys()', desc: '객체의 모든 키를 문자열 배열로 반환', code: 'Object.keys(obj); // ["name", "age"]' },
  { id: 51, category: '객체', title: 'Object.values()', desc: '객체의 모든 값을 배열로 반환', code: 'Object.values(obj);' },
  { id: 52, category: '객체', title: 'Object.entries()', desc: '객체의 [키, 값] 쌍을 담은 2차원 배열 반환', code: 'Object.entries(obj);' },
  { id: 53, category: '객체', title: 'Object.assign()', desc: '여러 객체를 하나로 병합 (얕은 복사)', code: 'Object.assign(target, source);' },
  { id: 54, category: '객체', title: 'Object.freeze()', desc: '객체 동결: 속성 추가, 삭제, 수정 불가', code: 'Object.freeze(obj);' },
  { id: 55, category: '객체', title: 'this 바인딩', desc: '함수를 호출한 객체를 가리키는 동적 식별자', code: 'obj.method = function() {\n  console.log(this);\n};' },

  // --- 배열 (56~73) ---
  { id: 56, category: '배열', title: '배열 리터럴', desc: '대괄호를 이용한 순차적 데이터 저장소', code: 'const arr = [1, 2, 3];' },
  { id: 57, category: '배열', title: 'push() / pop()', desc: '배열 끝에 요소를 추가하거나 제거', code: 'arr.push(4); // 끝에 추가\narr.pop();   // 끝에서 제거' },
  { id: 58, category: '배열', title: 'unshift() / shift()', desc: '배열 맨 앞에 요소를 추가하거나 제거', code: 'arr.unshift(0);\narr.shift();' },
  { id: 59, category: '배열', title: 'map()', desc: '모든 요소를 콜백 함수로 가공하여 새 배열 반환', code: 'arr.map(x => x * 2);' },
  { id: 60, category: '배열', title: 'filter()', desc: '조건을 만족(true)하는 요소만 모아 새 배열 반환', code: 'arr.filter(x => x > 2);' },
  { id: 61, category: '배열', title: 'reduce()', desc: '배열을 순회하며 누적된 연산 결과 단일 값 반환', code: 'arr.reduce((acc, cur) => acc + cur, 0);' },
  { id: 62, category: '배열', title: 'forEach()', desc: '배열의 각 요소에 대해 콜백 함수 실행 (반환값 없음)', code: 'arr.forEach(x => console.log(x));' },
  { id: 63, category: '배열', title: 'some()', desc: '하나라도 조건을 만족하는지 확인 (boolean)', code: 'arr.some(x => x % 2 === 0);' },
  { id: 64, category: '배열', title: 'every()', desc: '모든 요소가 조건을 만족하는지 확인 (boolean)', code: 'arr.every(x => x > 0);' },
  { id: 65, category: '배열', title: 'find()', desc: '조건을 만족하는 첫 번째 요소의 값 자체 반환', code: 'arr.find(x => x === 3);' },
  { id: 66, category: '배열', title: 'findIndex()', desc: '조건을 만족하는 첫 번째 요소의 인덱스 번호 반환', code: 'arr.findIndex(x => x === 3);' },
  { id: 67, category: '배열', title: 'includes()', desc: '특정 요소가 배열 내에 존재하는지 확인', code: 'arr.includes(2); // true' },
  { id: 68, category: '배열', title: 'sort()', desc: '배열 정렬 (기본은 문자열 사전순, 원본 변경됨)', code: 'arr.sort((a, b) => a - b);' },
  { id: 69, category: '배열', title: 'reverse()', desc: '배열 요소들의 순서를 반대로 뒤집음 (원본 변경)', code: 'arr.reverse();' },
  { id: 70, category: '배열', title: 'join()', desc: '모든 요소를 특정 구분자로 연결해 문자열로 생성', code: 'arr.join(",");' },
  { id: 71, category: '배열', title: 'slice()', desc: '배열의 특정 구간을 복사하여 새 배열 반환', code: 'arr.slice(1, 3);' },
  { id: 72, category: '배열', title: 'splice()', desc: '원하는 위치의 요소를 삭제, 추가, 교체 (원본 변경)', code: 'arr.splice(1, 1, "new");' },
  { id: 73, category: '배열', title: 'flat()', desc: '중첩된 다차원 배열을 지정한 깊이만큼 평탄화', code: '[1, [2, 3]].flat(); // [1, 2, 3]' },

  // --- ES6+ (74~85) ---
  { id: 74, category: 'ES6+', title: '배열 구조 분해 할당', desc: '배열의 요소를 각각의 변수에 직관적으로 할당', code: 'const [first, second] = [10, 20];' },
  { id: 75, category: 'ES6+', title: '객체 구조 분해 할당', desc: '객체의 속성명을 기준으로 변수에 할당', code: 'const { name, age } = user;' },
  { id: 76, category: 'ES6+', title: '스프레드 연산자 (배열)', desc: '기존 배열을 펼쳐서 새로운 배열 안에 병합/복사', code: 'const arr2 = [...arr1, 4, 5];' },
  { id: 77, category: 'ES6+', title: '스프레드 연산자 (객체)', desc: '기존 객체를 얕은 복사하며 새로운 속성 추가', code: 'const obj2 = { ...obj1, c: 3 };' },
  { id: 78, category: 'ES6+', title: '템플릿 리터럴', desc: '백틱(`)과 ${}를 이용해 변수 삽입이 쉬운 문자열', code: 'const str = `Hello ${name}`' },
  { id: 79, category: 'ES6+', title: 'Class', desc: '객체 지향 프로그래밍을 위한 문법적 설탕', code: 'class User {\n  constructor(name) {\n    this.name = name;\n  }\n}' },
  { id: 80, category: 'ES6+', title: '상속 (extends)', desc: '기존 클래스의 기능과 속성을 물려받음', code: 'class Admin extends User {}' },
  { id: 81, category: 'ES6+', title: 'super()', desc: '자식 클래스에서 부모 클래스의 생성자/메서드 호출', code: 'super(name);' },
  { id: 82, category: 'ES6+', title: 'Set', desc: '중복을 허용하지 않는 유일한 값들의 컬렉션', code: 'const set = new Set([1, 1, 2]); // {1, 2}' },
  { id: 83, category: 'ES6+', title: 'Map', desc: '다양한 타입을 키(Key)로 가질 수 있는 딕셔너리', code: 'const map = new Map();\nmap.set(key, val);' },
  { id: 84, category: 'ES6+', title: 'ES Modules (import)', desc: '다른 파일에서 내보낸 모듈을 가져옴', code: 'import { method } from "./utils.js";' },
  { id: 85, category: 'ES6+', title: 'ES Modules (export)', desc: '현재 파일의 변수나 함수를 모듈로 내보냄', code: 'export const num = 42;' },

  // --- 비동기 및 에러 처리 (86~91) ---
  { id: 86, category: '비동기/에러', title: 'Promise', desc: '비동기 작업의 완료, 혹은 실패를 표현하는 객체', code: 'new Promise((resolve, reject) => {\n  // 비동기 작업\n});' },
  { id: 87, category: '비동기/에러', title: 'then / catch', desc: 'Promise의 성공(결과물) 또는 실패(에러)를 처리', code: 'promise.then(res => {}).catch(err => {});' },
  { id: 88, category: '비동기/에러', title: 'async / await', desc: '비동기 코드를 동기적으로 보이게 작성하는 최신 문법', code: 'async function req() {\n  const res = await fetch(url);\n}' },
  { id: 89, category: '비동기/에러', title: 'try-catch', desc: '코드 실행 중 발생하는 에러를 우아하게 핸들링', code: 'try { \n  // 실행 코드\n} catch (error) { \n  // 에러 처리\n}' },
  { id: 90, category: '비동기/에러', title: 'throw', desc: '의도적으로 사용자 정의 예외(에러)를 발생시킴', code: 'throw new Error("Invalid Input");' },
  { id: 91, category: '비동기/에러', title: 'finally', desc: 'try-catch 성공 여부와 상관없이 무조건 마지막에 실행', code: 'try {} finally { cleanUp(); }' },

  // --- 브라우저 API 및 내장 객체 (92~100) ---
  { id: 92, category: '내장/API', title: 'setTimeout', desc: '지정한 밀리초(ms) 지연 이후에 한 번 실행', code: 'setTimeout(() => console.log("펑"), 1000);' },
  { id: 93, category: '내장/API', title: 'setInterval', desc: '지정한 밀리초(ms) 간격으로 지속해서 무한 반복 실행', code: 'setInterval(() => tick(), 1000);' },
  { id: 94, category: '내장/API', title: 'fetch()', desc: '네트워크(서버)로 HTTP 요청을 보내고 Promise 반환', code: 'fetch("api/data").then(r => r.json());' },
  { id: 95, category: '내장/API', title: 'JSON.parse()', desc: 'JSON 형태의 문자열을 자바스크립트 객체로 파싱', code: 'JSON.parse(\'{"a":1}\');' },
  { id: 96, category: '내장/API', title: 'JSON.stringify()', desc: '자바스크립트 객체를 JSON 문자열 형태로 직렬화', code: 'JSON.stringify({ a: 1 });' },
  { id: 97, category: '내장/API', title: 'Date 객체', desc: '현재 시간이나 특정 날짜를 다루는 내장 객체', code: 'const now = new Date();\nnow.getFullYear();' },
  { id: 98, category: '내장/API', title: 'Math 객체', desc: '수학 관련 상수와 유용한 함수 제공', code: 'Math.max(1, 5); // 5\nMath.random();' },
  { id: 99, category: '내장/API', title: 'localStorage', desc: '브라우저를 닫아도 지워지지 않는 영구 로컬 저장소', code: 'localStorage.setItem("key", "val");' },
  { id: 100, category: '내장/API', title: 'querySelector', desc: 'CSS 선택자 문법으로 DOM(태그 요소) 찾기', code: 'document.querySelector(".btn");' },
];

export default function JsSyntax100View() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', ...new Set(jsConcepts.map(item => item.category))];
  
  const filteredConcepts = useMemo(() => {
    if (activeCategory === 'All') return jsConcepts;
    return jsConcepts.filter(c => c.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💛 자바스크립트 핵심 문법 100선</h1>
        <p className={styles.desc}>프론트엔드 개발자가 반드시 알아야 할 필수 자바스크립트 문법 100가지를 모아두었습니다.</p>
      </div>

      <div className={styles.officialLinks}>
        <a href="https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide" target="_blank" rel="noopener noreferrer" className={styles.officialBtn}>
          📘 MDN 자바스크립트 안내서 (공식)
        </a>
        <a href="https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference" target="_blank" rel="noopener noreferrer" className={styles.officialBtn}>
          📙 MDN 자바스크립트 레퍼런스
        </a>
      </div>

      <div className={styles.filterGroup}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredConcepts.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.badge}>{item.category}</span>
              <span className={styles.idBadge}>#{item.id}</span>
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.desc}</p>
            <pre className={styles.codeBlock}>
              <code>{item.code}</code>
            </pre>
          </div>
        ))}
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/')}>
        🏠 홈으로 돌아가기
      </button>
    </div>
  );
}