/**
 * Basic example demonstrating ComposiFX core API
 */

import { Composition, Layer, easing } from '@composifx/core';

// Get canvas element
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Create composition
const composition = new Composition({
  width: 1920,
  height: 1080,
  duration: 5, // 5 seconds
  frameRate: 60,
  backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
});

// Create a simple layer with animated properties
const layer1 = new Layer({
  name: 'Animated Circle',
  position: { x: 960, y: 540 },
  scale: { x: 1, y: 1 },
  opacity: 1,
});

// Add layer to composition
composition.addLayer(layer1);

// Simple render loop (no WebGL yet, just Canvas 2D for demonstration)
function render() {
  // Clear canvas
  const bg = composition.backgroundColor;
  ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a / 255})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render each visible layer
  composition.layers.forEach((layer) => {
    if (!layer.visible) return;

    ctx.save();

    // Apply transforms
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.position.x, layer.position.y);
    ctx.rotate(layer.rotation);
    ctx.scale(layer.scale.x, layer.scale.y);

    // For this demo, draw a simple circle
    // In a real implementation, we'd render the layer source
    const time = composition.currentTime;
    const hue = (time / composition.duration) * 360;
    const radius = 100 + Math.sin(time * Math.PI) * 50;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.fill();

    ctx.restore();
  });

  // Update time display
  updateTimeDisplay();

  // Continue render loop
  requestAnimationFrame(render);
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

// Log to console to show API usage
console.log('ComposiFX Composition created:', composition);
console.log('Available easing functions:', Object.keys(easing));
console.log('Layer:', layer1);
