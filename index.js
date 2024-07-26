const canvas = document.getElementById("game");
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext("2d");

// localStorage.removeItem('highScore')
class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let isGameStarted = false; // 게임 상태 체크
let isWallLessMode = false; // 벽 없는 모드 상태
let vibrateEnabled = false; // 진동 상태를 나타내는 변수
let speed = 5;
let tileCount = 20;
let tileSize = canvas.width / tileCount -2; //타일 크기
let headX = 10;
let headY = 10;
const snakeParts = [];
let tailLength = 2;
let appleX = 5;
let appleY = 5;
let inputsXVelocity = 0;
let inputsYVelocity = 0;
let xVelocity = 0;
let yVelocity = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0; // 로컬스토리지에서 최고 점수 불러오기
const gulpSound = new Audio("gulp.mp3");
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let giftX = Math.floor(Math.random() * tileCount); // item 추가
let giftY = Math.floor(Math.random() * tileCount);
let giftState = 1; // 상태 값: 1, 2, 3 중 하나
const giftColors = ["gold", "cyan", "salmon","lavender", "blue", "lime", "purple", "pink"];
let gameStartTime;
const giftDisplayDelay = 10000; // 선물이 노출되기까지의 지연 시간 (밀리초)
let giftVisible = false; // 선물의 가시성 상태
let giftStartTime; // 선물이 노출된 시작 시간
let giftMessage = ""; // 상태 메시지를 저장할 변수
const messageOffsetX = 10; // 메시지와 뱀의 머리 사이의 간격
const messageOffsetY = tileSize / 2; // 메시지의 세로 위치 조정
const giftMessageDisplayDuration = 2000; // 메시지 노출 지속 시간 (밀리초)
let apples = []; // 랜덤 위치에 나타날 사과 배열 // case5 사과 폭탄
let appleStartTime = 0; // 사과 노출 시작 시간
const appleDisplayDuration = 7000; // 사과 노출 지속 시간 (밀리초)


canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;
  handleSwipe();
}

function handleSwipe() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // 좌우 스와이프
    if (diffX > 0 && inputsXVelocity !== -1) {
      // 오른쪽 스와이프
      inputsXVelocity = 1;
      inputsYVelocity = 0;
    } else if (diffX < 0 && inputsXVelocity !== 1) {
      // 왼쪽 스와이프
      inputsXVelocity = -1;
      inputsYVelocity = 0;
    }
  } else {
    // 상하 스와이프
    if (diffY > 0 && inputsYVelocity !== -1) {
      // 아래쪽 스와이프
      inputsXVelocity = 0;
      inputsYVelocity = 1;
    } else if (diffY < 0 && inputsYVelocity !== 1) {
      // 위쪽 스와이프
      inputsXVelocity = 0;
      inputsYVelocity = -1;
    }
  }
}

function drawGame() {
  if (!isGameStarted) return; // 게임이 시작되지 않았으면 drawGame을 실행하지 않음
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  changeSnakePosition();
  let result = isGameOver();
  if (result) {
    isGameStarted = false; // 게임 오버 시 게임 시작 상태를 false로 설정
    return;
  }

  clearScreen();
  checkAppleCollision();
  drawSnake();
  drawApple();
  checkGiftVisibility(); // 선물 가시성 체크
  drawGift(); // 선물 그리기
  drawScore();

  // 사과가 노출된 상태일 때 사과 그리기
  if (apples.length > 0) {
    drawApples(); // 사과 그리기
  }
  checkGiftCollision(); // 선물 충돌 확인

  if (score > 20) speed = 10;
  if (score > 60) speed = 20;

  setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  //walls
  if (!isWallLessMode) {
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
      gameOver = true;
    }
  }

  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    if (part.x === headX && part.y === headY) {
      gameOver = true;
      break;
    }
  }

  if (gameOver) {
    // 최고 점수 업데이트
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore); // 로컬스토리지에 최고 점수 저장
    }
    ctx.fillStyle = "white";
    ctx.font = "50px Verdana";

    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");
    ctx.fillStyle = gradient;
    ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2 - 25); // 첫 번째 줄
    ctx.font = "20px Verdana"; // 폰트 크기 조절 //최고 점수 표시
    ctx.fillStyle = "white"; // 색상 조절 (필요시)
    ctx.fillText("현재 최고점수: " + highScore, canvas.width / 6.5, canvas.height / 2 + 25); // 두 번째 줄

     document.getElementById("restartButton").style.display = "block";  // 다시 시작 버튼 표시
  }

  return gameOver;
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "10px Verdana";
  ctx.fillText("현재 점수 " + score, canvas.width - 60, 10);
  ctx.fillText("최고 점수 " + highScore, canvas.width - 120, 10);


  // item 획득 메시지 표시
  if (giftMessage) {
    ctx.font = "20px Verdana"; // 상태 메시지 폰트 크기
    ctx.fillStyle = "lime"; // 상태 메시지 색상
    const messageX = (headX * tileCount) + tileSize + messageOffsetX;
    const messageY = (headY * tileCount) + messageOffsetY;
    ctx.fillText(giftMessage, messageX, messageY);

    // 메시지 노출 후 3초가 지나면 빈 문자열로 초기화
    if (Date.now() - giftMessageStartTime >= giftMessageDisplayDuration) {
      giftMessage = ""; // 상태 메시지 초기화
    }
  }
}

function clearScreen() {
  ctx.fillStyle = "#313131";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  ctx.fillStyle = "skyBlue";
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
  }

  snakeParts.push(new SnakePart(headX, headY)); 
  while (snakeParts.length > tailLength) {
    snakeParts.shift();
  }

  ctx.fillStyle = "orange";
  ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
}

function changeSnakePosition() {
  headX = headX + xVelocity;
  headY = headY + yVelocity;

  if (isWallLessMode) {
    // 벽 없는 모드 로직
    if (headX < 0) headX = tileCount - 1;
    if (headX >= tileCount) headX = 0;
    if (headY < 0) headY = tileCount - 1;
    if (headY >= tileCount) headY = 0;
} else {
    // 벽 있는 모드 로직
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }
}
}

function drawApple() {
  ctx.fillStyle = "red";
  
  // 사과의 위치 및 크기 설정
  const x = appleX * tileCount;
  const y = appleY * tileCount;
  const size = tileSize;

  // 둥근 모서리를 가진 사각형 그리기
  const radius = 8; // 둥글게 할 반지름

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.arc(x + size - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
  ctx.lineTo(x + size, y + size - radius);
  ctx.arc(x + size - radius, y + size - radius, radius, 0, 0.5 * Math.PI);
  ctx.lineTo(x + radius, y + size);
  ctx.arc(x + radius, y + size - radius, radius, 0.5 * Math.PI, Math.PI);
  ctx.lineTo(x, y + radius);
  ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawGift() {
  if (!giftVisible) return; // 선물이 보이지 않을 때는 그리지 않음
  
  const giftColor = giftColors[Math.floor(Math.random() * giftColors.length)];
  ctx.fillStyle = giftColor; // 선물 색상

  const centerX = giftX * tileCount + tileSize / 2;
  const centerY = giftY * tileCount + tileSize / 2;
  const radius = tileSize / 2; // 별의 크기

  // 별 모양 그리기
  const spikes = 5; // 별의 점 개수
  const outerRadius = radius;
  const innerRadius = radius / 2.5; // 별의 안쪽 반지름
  const step = Math.PI / spikes; // 별의 각 점을 계산하기 위한 각도

  ctx.beginPath();
  for (let i = 0; i < 2 * spikes; i++) {
    // 외부 점과 내부 점을 번갈아 가며 그립니다
    const angle = i * step;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}


function checkGiftCollision() {
  if (!giftVisible) return; // 선물이 보이지 않을 때는 충돌 체크를 하지 않음

  if (giftX === headX && giftY === headY) {
    // 선물 상태에 따라 동작 수행
    switch (giftState) {
      case 1:
        // 상태 1: 점수 증가
        score += 15;
        giftMessage = "점수 +15";
        break;
      case 2:
        // 상태 2: 속도 감소
        speed -= 3;
        giftMessage = "속도 감소 -3";
        break;
      case 3:
        // 상태 3: 뱀의 길이 증가
        tailLength += 3;
        giftMessage = "길이 +3";
        break;
      case 4:
      // 상태 3: 뱀의 길이 감소
      tailLength -= 7;
      giftMessage = "길이 -7";
      break;
      case 5:
      // 상태 5: 사과 20개 랜덤 위치에 노출
      apples = []; // 사과 배열 초기화
      for (let i = 0; i < 30; i++) {
        apples.push({
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount)
        });
      }
      appleStartTime = Date.now(); // 사과 노출 시작 시간 설정
      giftMessage = "보너스!";
      break;
    }
    
    // 상태 메시지 시작 시간 설정
    giftMessageStartTime = Date.now();
  
    giftVisible = false; // 현재 선물 숨기기
    giftStartTime = Date.now(); // 선물 노출 시간을 현재 시간으로 설정
    gulpSound.play(); // 충돌 시 소리 재생 (선택 사항)

    // 새로운 선물 위치와 상태를 랜덤으로 설정
    giftX = Math.floor(Math.random() * tileCount);
    giftY = Math.floor(Math.random() * tileCount);
    giftState = Math.floor(Math.random() * 5) + 1; // 1, 2, 3, 4 중 하나
    // giftState = 5

    gulpSound.play(); // 충돌 시 소리 재생 (선택 사항)
  }
}

function drawApples() {
  ctx.fillStyle = "red"; // 사과 색상
  apples.forEach(apple => {
    ctx.beginPath();
    const x = apple.x * tileCount;
    const y = apple.y * tileCount;
    const size = tileSize;
    const radius = 8; // 둥글게 할 반지름

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + size - radius, y);
    ctx.arc(x + size - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(x + size, y + size - radius);
    ctx.arc(x + size - radius, y + size - radius, radius, 0, 0.5 * Math.PI);
    ctx.lineTo(x + radius, y + size);
    ctx.arc(x + radius, y + size - radius, radius, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.fill();
  });

  // 사과 노출 시간이 지난 후 사과를 숨깁니다
  if (Date.now() - appleStartTime >= appleDisplayDuration) {
    apples = []; // 사과 배열 비우기
  }
}

function checkAppleCollision() {
  if (apples.length > 0) { // 사과가 있는 경우
    // 사과 배열에서 충돌한 사과를 찾습니다
    apples = apples.filter(apple => {
      if (apple.x === headX && apple.y === headY) {
        // 충돌한 사과를 배열에서 제거하고 점수를 증가시킵니다
        score++;
        tailLength++;
        gulpSound.play();
        return false; // 이 사과를 배열에서 제거합니다
      }
      return true; // 충돌하지 않은 사과는 유지합니다
    });
  } else {
    if (appleX === headX && appleY === headY) {
      // 충돌한 사과를 배열에서 제거하고 점수를 증가시킵니다
      score++;
      tailLength++;
      gulpSound.play();
      
      // 새로운 사과 위치 설정
      appleX = Math.floor(Math.random() * tileCount);
      appleY = Math.floor(Math.random() * tileCount);
    }
  }
}

document.body.addEventListener("keydown", keyDown);

function keyDown(event) {
  //up
  if (event.keyCode == 38 || event.keyCode == 87) {
    if (inputsYVelocity == 1) return;
    inputsYVelocity = -1;
    inputsXVelocity = 0;
  }

  //down
  if (event.keyCode == 40 || event.keyCode == 83) {
    if (inputsYVelocity == -1) return;
    inputsYVelocity = 1;
    inputsXVelocity = 0;
  }

  //left
  if (event.keyCode == 37 || event.keyCode == 65) {
    if (inputsXVelocity == 1) return;
    inputsYVelocity = 0;
    inputsXVelocity = -1;
  }

  //right
  if (event.keyCode == 39 || event.keyCode == 68) {
    if (inputsXVelocity == -1) return;
    inputsYVelocity = 0;
    inputsXVelocity = 1;
  }
}


function toggleVibrate() {
  vibrateEnabled = !vibrateEnabled; // 진동 상태 토글
  document.getElementById('vibrateStatus').textContent = vibrateEnabled ? '진동 on' : '진동 off';
  document.getElementById('vibrateToggle').textContent = vibrateEnabled ? '진동 끄기' : '진동 켜기';
}

//controller
document.getElementById('up').addEventListener('click', () => setDirection('UP'));
document.getElementById('left').addEventListener('click', () => setDirection('LEFT'));
document.getElementById('right').addEventListener('click', () => setDirection('RIGHT'));
document.getElementById('down').addEventListener('click', () => setDirection('DOWN'));

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

function setDirection(direction) {
  if (navigator.vibrate && vibrateEnabled) {
    navigator.vibrate(100); // 진동
  }

  let newInputsXVelocity = inputsXVelocity;
  let newInputsYVelocity = inputsYVelocity;

  switch(direction) {
    case 'UP':
      if (inputsYVelocity !== 1) {
        newInputsYVelocity = -1;
        newInputsXVelocity = 0;
      }
      break;
    case 'DOWN':
      if (inputsYVelocity !== -1) {
        newInputsYVelocity = 1;
        newInputsXVelocity = 0;
      }
      break;
    case 'LEFT':
      if (inputsXVelocity !== 1) {
        newInputsYVelocity = 0;
        newInputsXVelocity = -1;
      }
      break;
    case 'RIGHT':
      if (inputsXVelocity !== -1) {
        newInputsYVelocity = 0;
        newInputsXVelocity = 1;
      }
      break;
  }
  // 현재 입력 속도와 새 속도가 다를 경우에만 업데이트
  if (inputsXVelocity !== newInputsXVelocity || inputsYVelocity !== newInputsYVelocity) {
    inputsXVelocity = newInputsXVelocity;
    inputsYVelocity = newInputsYVelocity;
  }
}

function restartGame() {
  window.location.reload();
}

function checkGiftVisibility() {
  const currentTime = Date.now();
  
  // 선물이 보이지 않거나 선물이 처음 노출되었을 때
  if (!giftVisible && currentTime - giftStartTime >= giftDisplayDelay) {
    // 10초가 지났다면 선물 보이기
    giftVisible = true;
    giftStartTime = currentTime; // 선물이 노출된 시간을 현재 시간으로 설정
  } else if (giftVisible && currentTime - giftStartTime >= giftDisplayDelay) {
    // 선물이 보이고 10초가 지나면 선물 숨기기
    giftVisible = false;
    giftStartTime = currentTime; // 선물이 숨겨진 시간을 현재 시간으로 설정
  }
}

function startGame(isWallLess = false) {
  isWallLessMode = isWallLess; // 벽 제거 모드 설정
  if (!isGameStarted) {
    isGameStarted = true;
    document.getElementById("start-screen").style.display = "none"; // 게임 시작 시 시작 화면 숨기기
    document.getElementById("restartButton").style.display = "none"; // 재시작 버튼 숨기기
    gameStartTime = Date.now();
    giftVisible = false; // 게임 시작 시 선물은 보이지 않음
    giftStartTime = gameStartTime; // 게임 시작 시간으로 설정
    drawGame();
  }
}
