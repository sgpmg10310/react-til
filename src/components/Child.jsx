// 자식 컴포넌트 (로그가 계속 찍힘 😭)

import React from 'react';
import HeavyCalc from './ChildChild';

const mainMenu = [
  {
    name: 'Home',
    path: '/',
  },
  {
    name: 'About',
    path: '/about',
  },
  {
    name: 'Contact',
    path: '/contact',
  }
]

const test = [
 {name: 'test', age: 20},
 {name: 'test2', age: 21},
 {name: 'test3', age: 22},
]
const Child = React.memo(({ name }) => {
  console.log(`${name} 렌더링!`);
  return (
    <>
      <HeavyCalc />
      <div>{name}는 가만히 있어요.</div>
      <ul>
        {mainMenu.map((menu, index) => (
          <li key={index}>
            <a href={menu.path}>{menu.name}</a>
          </li>
        ))}
      </ul>
      <ul>
        {
          test.map((item, idx) => {
            return (
              <li key={idx}>
                {item.name} {item.age}
              </li>
            )
          })
        }
      </ul>
    </>
  );
});
export default Child;


// const Child = ({ name }) => {
//   console.log(`${name} 렌더링!`);
//   return <div>{name}는 가만히 있어요.</div>;
// };
// export default Child;


