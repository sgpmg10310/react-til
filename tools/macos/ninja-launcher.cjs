const { exec } = require('node:child_process');

const GAME_URL = 'https://sgpmg10310.github.io/react-til/games/ninja/index.html';

function openGame() {
  // macOS 기본 브라우저에서 게임 URL을 엽니다.
  exec(`open "${GAME_URL}"`, (error) => {
    if (error) {
      process.stderr.write(`게임 실행 실패: ${error.message}\n`);
      process.exit(1);
    }
  });
}

openGame();
