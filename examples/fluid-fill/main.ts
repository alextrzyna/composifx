/**
 * FluidFill Effect Example
 *
 * Demonstrates the FluidFill effect with interactive controls
 */

import { Composition, Layer, easing } from '@composifx/core';
import { WebGL2Renderer } from '@composifx/renderer-webgl2';
import { FluidFill } from '@composifx/effect-fluid-fill';
import type { FillDirection } from '@composifx/effect-fluid-fill';

// Create composition
const comp = new Composition({
  width: 800,
  height: 600,
  duration: 5,
  frameRate: 60,
});

// Get canvas element
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Set canvas size
canvas.width = comp.width;
canvas.height = comp.height;

// Create WebGL2 renderer
const renderer = new WebGL2Renderer(canvas);

// Create a simple test image with transparency
function createTestImage(): HTMLCanvasElement {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 400;
  tempCanvas.height = 400;
  const ctx = tempCanvas.getContext('2d')!;

  // Draw a star shape with transparency around it
  ctx.fillStyle = '#4a90e2';

  // Draw star
  ctx.beginPath();
  const centerX = 200;
  const centerY = 200;
  const outerRadius = 150;
  const innerRadius = 70;
  const points = 5;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();

  // Add some decorative circles
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * outerRadius * 0.7;
    const y = centerY + Math.sin(angle) * outerRadius * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  return tempCanvas;
}

// Create layer with test image
const testImage = createTestImage();
const starLayer = new Layer({
  name: 'star',
  source: testImage,
});

// Position layer in center
starLayer.position.value = { x: 200, y: 100 };

// Create FluidFill effect
const fluidFill = new FluidFill({
  direction: 'center-out',
  fillColor: { r: 255, g: 107, b: 53, a: 255 },
  speed: 1.0,
  progress: 0,
});

// Add effect to layer
starLayer.addEffect(fluidFill);

// Animate fill progress
fluidFill.animate('progress', [
  { time: 0, value: 0 },
  { time: 3, value: 1, easing: easing.easeInOutCubic },
]);

// Add layer to composition
comp.addLayer(starLayer);

// Render loop
let isPlaying = false;
let startTime = 0;

function render(timestamp: number) {
  if (isPlaying) {
    if (startTime === 0) {
      startTime = timestamp;
    }
    const elapsed = (timestamp - startTime) / 1000;
    const time = elapsed % comp.duration;

    comp.seek(time);
  }

  renderer.render(comp, comp.currentTime);
  requestAnimationFrame(render);
}

// Start render loop
requestAnimationFrame(render);

// UI Controls
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const progressSlider = document.getElementById('progress-slider') as HTMLInputElement;
const progressValue = document.getElementById('progress-value') as HTMLSpanElement;
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
const directionBtns = document.querySelectorAll('.direction-btn') as NodeListOf<HTMLButtonElement>;

// Playback controls
playBtn.addEventListener('click', () => {
  isPlaying = true;
  startTime = 0;
  console.log('Playing composition');
});

pauseBtn.addEventListener('click', () => {
  isPlaying = false;
  console.log('Paused composition');
});

resetBtn.addEventListener('click', () => {
  isPlaying = false;
  startTime = 0;
  comp.seek(0);
  progressSlider.value = '0';
  progressValue.textContent = '0%';
  console.log('Reset composition');
});

// Progress slider
progressSlider.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  const value = parseInt(target.value) / 100;
  progressValue.textContent = `${target.value}%`;

  // Manually set progress (override animation)
  isPlaying = false;
  const param = fluidFill.parameters['progress'];
  if (param) {
    param.clearKeyframes();
    param.addKeyframe({ time: 0, value });
  }
  comp.seek(0);
});

// Speed slider
speedSlider.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  const value = parseInt(target.value) / 50;
  speedValue.textContent = `${value.toFixed(1)}x`;

  const param = fluidFill.parameters['speed'];
  if (param) {
    param.clearKeyframes();
    param.addKeyframe({ time: 0, value });
  }
});

// Direction buttons
directionBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    directionBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const direction = btn.dataset.direction as FillDirection;
    fluidFill.setDirection(direction);
    console.log(`Set direction to: ${direction}`);
  });
});

// Initial render
comp.seek(0);
renderer.render(comp, 0);

console.log('ComposiFX FluidFill Example initialized');
console.log('Composition:', comp);
console.log('FluidFill effect:', fluidFill);
