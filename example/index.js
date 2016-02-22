import fillPath from '/lib/index.js';

const clear = document.getElementById('clear-button');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

context.fillStyle = 'rgba(0, 125, 255, 0.5)';
context.lineWidth = 2;

const openShapes = [];
const closedShapes = [];
let isDrawing = false;

clear.addEventListener('click', (event) => {
  openShapes.splice(0, openShapes.length);
  closedShapes.splice(0, closedShapes.length);
});

canvas.addEventListener('click', (event) => {
  const { offsetX: x, offsetY: y } = event;

  closedShapes.push(...fillPath(openShapes, { x, y }));
});

canvas.addEventListener('mousedown', (event) => {
  const { offsetX: x, offsetY: y } = event;

  isDrawing = true;
  openShapes.unshift([{ x, y }]);
});

canvas.addEventListener('mousemove', (event) => {
  const { offsetX: x, offsetY: y } = event;

  if (isDrawing) {
    openShapes[0].push({ x, y });
  }
});

canvas.addEventListener('mouseup', (event) => {
  if (openShapes[0].length === 1) {
    openShapes.splice(0, 1);
  }
  isDrawing = false;
});

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  for (const shape of openShapes) {
    for (let i = 0; i < shape.length; i ++) {
      const point = shape[i];
      if (i === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
  }
  context.stroke();

  context.beginPath();
  for (const shape of closedShapes) {
    for (let i = 0; i < shape.length; i ++) {
      const point = shape[i];
      if (i === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
  }
  context.fill();
}

(function loop() {
  render();
  window.requestAnimationFrame(loop);
}());
