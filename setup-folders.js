import fs from 'fs';

const dirs = [
  'src/components/common',
  'src/contexts',
  'src/store',
  'src/pages/react',
  'src/pages/vue',
  'src/pages/frameworks',
  'src/pages/backend',
  'src/pages/methodology',
  'src/pages/hobby',
  'src/pages/test'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✅ 폴더 생성 완료: ${dir}`);
});