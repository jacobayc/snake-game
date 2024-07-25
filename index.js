const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let speed = 7;

let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;

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
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  changeSnakePosition();
  let result = isGameOver();
  if (result) {
    return;
  }

  clearScreen();

  checkAppleCollision();
  drawApple();
  drawSnake();

  drawScore();

  if (score > 5) {
    speed = 9;
  }
  if (score > 10) {
    speed = 11;
  }

  setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  //walls
  if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
    gameOver = true;
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
    // 첫 번째 줄
    ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2 - 25); 

     //최고 점수 표시
    ctx.font = "20px Verdana"; // 폰트 크기 조절
    ctx.fillStyle = "white"; // 색상 조절 (필요시)
    ctx.fillText("현재 최고점수: " + highScore, canvas.width / 6.5, canvas.height / 2 + 25);

     // 다시 시작 버튼 표시
     document.getElementById("restartButton").style.display = "block";

    // setTimeout(()=> {
    //   window.location.reload();
    // },2000)
  }

  return gameOver;
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "10px Verdana";
  ctx.fillText("현재 점수 " + score, canvas.width - 50, 10);
  ctx.fillText("최고 점수 " + highScore, canvas.width - 110, 10);

}

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  ctx.fillStyle = "green";
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
}

function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

function checkAppleCollision() {
  if (appleX === headX && appleY === headY) {
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
    tailLength++;
    score++;
    gulpSound.play();
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

function restartGame() {
  window.location.reload();
}

drawGame();
