import throttle from 'lodash.throttle';
import { useEffect } from 'react';

const PaddleBall = () => {
  // ****************
  // GLOBAL VARIABLES
  // ****************

  let canvas, ctx, framesPerSecond;
  let ballX, ballY;
  let ballSpeedX, ballSpeedY;
  let BALL_RADIUS = 10;

  let PADDLE_WIDTH = 100;
  let PADDLE_THICKNESS = 10;
  let PADDLE_DIST_FROM_EDGE = 60;
  let paddleX = 400;

  let BRICK_W = 80;
  let BRICK_H = 20;
  let BRICK_GAP = 2;
  const BRICK_COLS = 10;
  const BRICK_ROWS = 14;
  let brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
  let bricksLeft = 0;

  let mouseX;

  // ******
  // ONLOAD
  // ******

  useEffect(() => {
    start();
    console.log('Only runs once cause react is not actually re-rendering, it doesn\t keep track of the game');
  })

  const start = () => {
      mouseX = 0;
      ballX = 75;
      ballY = 75;
      ballSpeedX = 8;
      ballSpeedY = 8;
      canvas = document.querySelector('#canvas');
      ctx = canvas.getContext('2d');
      
      framesPerSecond = 30;
      setInterval(updateAll, 1000 / framesPerSecond);
      
      canvas.addEventListener('mousemove', updateMousePos)

      window.addEventListener('resize', updateSizing);

      resize();
      
      brickReset();
      ballReset();
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = Math.min(window.innerWidth * 0.75, window.innerHeight);

    BALL_RADIUS = canvas.width * 0.01;

    PADDLE_WIDTH = canvas.width * 0.1;
    PADDLE_THICKNESS = PADDLE_WIDTH * 0.1;
    PADDLE_DIST_FROM_EDGE = Math.min(canvas.height * 0.1, 60);

    BRICK_W = canvas.width * 0.1;
    BRICK_H = BRICK_W * 0.25;
    BRICK_GAP = BRICK_H * 0.1;

    ballSpeedX = canvas.width * 0.01;
    ballSpeedY = canvas.width * 0.01;

    brickReset();
    ballReset();
  }

  const updateSizing = throttle(resize, 1000);

  function updateAll() {
      moveAll();
      drawAll();
  }

  function brickReset() {
      bricksLeft = 0;
      var i;
      for (i = 0; i < 3 * BRICK_COLS; i++) {
          brickGrid[i] = false;
      }
      for (; i < BRICK_COLS * BRICK_ROWS; i++){
          brickGrid[i] = true;
          bricksLeft++;
      }
  }

  // **********
  // USER INPUT
  // **********
  function updateMousePos(event){
      var rect = canvas.getBoundingClientRect();
      var root = document.documentElement;
      mouseX = event.clientX - rect.left - root.scrollLeft;
      
      paddleX = mouseX - PADDLE_WIDTH/2;
  }

  // *******
  // UTILITY
  // *******

  function rowColToArrayIndex(col, row) {
    return col + BRICK_COLS * row;
  }

  function isBrickAtColRow(col, row) {
    if (col >= 0 && col < BRICK_COLS &&
        row >= 0 && row < BRICK_ROWS) {
            var brickIndexUnderCoord = rowColToArrayIndex(col, row);
            return brickGrid[brickIndexUnderCoord]
    } else {
        return false;
    }
  }

  // ********
  // GAMEPLAY
  // ********
  function ballReset() {
      ballX = canvas.width / 2;
      ballY = BRICK_ROWS * (BRICK_H + BRICK_GAP);
  }

  function ballMove() {
      ballX+= ballSpeedX;
      ballY+= ballSpeedY;

      if(ballY > canvas.height) { // bottom
          ballReset();
          brickReset();
      }
      if(ballY < 0 && ballSpeedY < 0.0) { // top
          ballSpeedY *= -1;
      }
      
      if(ballX > canvas.width && ballSpeedX > 0.0) { // right
          ballSpeedX *= -1;
      }
      if(ballX < 0 && ballSpeedX < 0.0) { // left
          ballSpeedX *= -1;
      }
  }

  function ballBrickHandling() {
      var ballBrickCol = Math.floor(ballX / BRICK_W);
      var ballBrickRow = Math.floor(ballY / BRICK_H);
      var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

      if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
          ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS &&
          brickIndexUnderBall >= 0 && brickIndexUnderBall < BRICK_COLS * BRICK_ROWS) {

          if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
              brickGrid[brickIndexUnderBall] = false;
              bricksLeft--;

              var prevBallX = ballX - ballSpeedX;
              var prevBallY = ballY - ballSpeedY;
              var prevBrickCol = Math.floor(prevBallX / BRICK_W);
              var prevBrickRow = Math.floor(prevBallY / BRICK_H);

              var bothTestsFailed = true;

              if (prevBrickCol !== ballBrickCol) {
                  if (isBrickAtColRow(prevBrickCol, ballBrickRow) === false) {
                      ballSpeedX *= -1;
                      bothTestsFailed = false;
                  }
              }

              if (prevBrickRow !== ballBrickRow) {
                  if (isBrickAtColRow(ballBrickCol, prevBrickRow) === false) {
                      ballSpeedY *= -1;
                      bothTestsFailed = false;
                  }
              }

              // prevents ball from going through
              if (bothTestsFailed) {
                  ballSpeedX *= -1;
                  ballSpeedY *= -1;
              }
          }
      }
  }

  function ballPaddleHandling() {
      var paddleTopEdgeY = canvas.height-PADDLE_DIST_FROM_EDGE;
      var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
      var paddleLeftEdgeX = paddleX;
      var paddleRightEdgeX = paddleX + PADDLE_WIDTH;
      if(ballY > paddleTopEdgeY && // below the top of paddle
        ballY < paddleBottomEdgeY && // above the bottom of paddle
        ballX > paddleLeftEdgeX && // right of the left side of paddle
        ballX < paddleRightEdgeX) { // left of the right side of paddle
          ballSpeedY *= -1;
          
          var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
          var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
          ballSpeedX = ballDistFromPaddleCenterX * 0.35;

          if (bricksLeft === 0) {
              brickReset();
          }
      } 
  }

  function moveAll() {
      ballMove();
      ballBrickHandling();
      ballPaddleHandling();
  }

  // **************
  // CANVAS DRAWING
  // **************
  function drawAll() {
      colorRect(0, 0, canvas.width,canvas.height, 'black');
      colorCircle(ballX, ballY, BALL_RADIUS, 'white');
      colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS,'white');

      drawBricks();
  }

  function drawBricks() {
      for (var eachRow=0; eachRow < BRICK_ROWS; eachRow++) {
          for (var eachCol=0; eachCol < BRICK_COLS; eachCol++) {

              var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

              if (brickGrid[arrayIndex]){
                  colorRect(BRICK_W * eachCol, BRICK_H * eachRow, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
              }
          }
      }
  }

  function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
      ctx.fillStyle = fillColor;
      ctx.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
  }

  function colorCircle(centerX,centerY, radius, fillColor){
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(centerX,centerY, radius, 0, Math.PI*2, true);
      ctx.fill();
  }
  return (
    <div className="App">
      <canvas id="canvas" style={{ display: 'block', cursor: 'none' }} />
    </div>
  );
}

export default PaddleBall;
