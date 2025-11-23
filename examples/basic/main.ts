/**
 * Basic example demonstrating ComposiFX with WebGL2 renderer
 */

import { Composition, Layer, easing } from '@composifx/core';
import { WebGL2Renderer } from '@composifx/renderer-webgl2';

// Get canvas element
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Create WebGL2 renderer
const renderer = new WebGL2Renderer(canvas, {
  alpha: true,
  antialias: true,
});

// Create composition
const composition = new Composition({
  width: 1920,
  height: 1080,
  duration: 5, // 5 seconds
  frameRate: 60,
  backgroundColor: { r: 20, g: 20, b: 30, a: 255 },
});

// Create a simple canvas as layer source
function createTestImage(): HTMLCanvasElement {
  const size = 400;
  const testCanvas = document.createElement('canvas');
  testCanvas.width = size;
  testCanvas.height = size;

  const ctx = testCanvas.getContext('2d')!;

  // Create a gradient circle
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, '#ff6b35');
  gradient.addColorStop(0.5, '#f7931e');
  gradient.addColorStop(1, '#fdc830');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Add some text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ComposiFX', size / 2, size / 2);

  return testCanvas;
}

// Create layers with animated properties
const layer1 = new Layer({
  name: 'Logo',
  source: createTestImage(),
  position: { x: 960, y: 540 },
  scale: { x: 1, y: 1 },
  opacity: 1,
});

// Animate layer properties
layer1.position.animate([
  { time: 0, value: { x: 960, y: 340 }, easing: easing.easeOutCubic },
  { time: 2, value: { x: 960, y: 540 }, easing: easing.easeInOutCubic },
  { time: 4, value: { x: 960, y: 740 }, easing: easing.easeInCubic },
]);

layer1.scale.animate([
  { time: 0, value: { x: 0.5, y: 0.5 }, easing: easing.easeOutElastic },
  { time: 1.5, value: { x: 1.2, y: 1.2 }, easing: easing.easeInOutQuad },
  { time: 3, value: { x: 1, y: 1 }, easing: easing.easeInOutQuad },
]);

layer1.rotation.animate([
  { time: 0, value: 0 },
  { time: 5, value: Math.PI * 2, easing: easing.linear },
]);

layer1.opacity.animate([
  { time: 0, value: 0, easing: easing.easeInQuad },
  { time: 0.5, value: 1, easing: easing.easeOutQuad },
  { time: 4.5, value: 1, easing: easing.easeInQuad },
  { time: 5, value: 0 },
]);

// Add layers to composition
composition.addLayer(layer1);

// Render loop
let animationFrameId: number;

function render() {
  // Render the composition using WebGL2
  renderer.render(composition, composition.currentTime);

  // Update time display
  updateTimeDisplay();

  // Continue render loop
  animationFrameId = requestAnimationFrame(render);
}

// Start render loop
render();

// UI Controls
const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

playBtn.addEventListener('click', () => {
  composition.play();
  playBtn.disabled = true;
  pauseBtn.disabled = false;
});

pauseBtn.addEventListener('click', () => {
  composition.pause();
  playBtn.disabled = false;
  pauseBtn.disabled = true;
});

resetBtn.addEventListener('click', () => {
  composition.pause();
  composition.seek(0);
  playBtn.disabled = false;
  pauseBtn.disabled = true;
});

composition.on('complete', () => {
  playBtn.disabled = false;
  pauseBtn.disabled = true;
});

function updateTimeDisplay() {
  const timeDisplay = document.getElementById('timeDisplay')!;
  timeDisplay.textContent = `${composition.currentTime.toFixed(2)}s / ${composition.duration.toFixed(2)}s`;
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrameId);
  renderer.dispose();
});

// Log to console to show API usage
console.log('ComposiFX Composition created:', composition);
console.log('WebGL2 Renderer initialized:', renderer);
console.log('Available easing functions:', Object.keys(easing));
console.log('Layer:', layer1);
