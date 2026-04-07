// 자식 컴포넌트 (로그가 계속 찍힘 😭)

import React from 'react';


const Child = React.memo(({ name }) => {
  console.log(`${name} 렌더링!`);
  return <div>{name}는 가만히 있어요.</div>;
});
export default Child;


// const Child = ({ name }) => {
//   console.log(`${name} 렌더링!`);
//   return <div>{name}는 가만히 있어요.</div>;
// };
// export default Child;


