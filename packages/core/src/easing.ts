/**
 * Easing functions for animation
 * Based on standard easing equations
 */

import type { EasingFunction } from './types.js';

/**
 * Linear easing (no easing)
 */
const linear: EasingFunction = (t: number) => t;

/**
 * Quadratic easing in
 */
const easeInQuad: EasingFunction = (t: number) => t * t;

/**
 * Quadratic easing out
 */
const easeOutQuad: EasingFunction = (t: number) => t * (2 - t);

/**
 * Quadratic easing in and out
 */
const easeInOutQuad: EasingFunction = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * Cubic easing in
 */
const easeInCubic: EasingFunction = (t: number) => t * t * t;

/**
 * Cubic easing out
 */
const easeOutCubic: EasingFunction = (t: number) => --t * t * t + 1;

/**
 * Cubic easing in and out
 */
const easeInOutCubic: EasingFunction = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

/**
 * Quartic easing in
 */
const easeInQuart: EasingFunction = (t: number) => t * t * t * t;

/**
 * Quartic easing out
 */
const easeOutQuart: EasingFunction = (t: number) => 1 - --t * t * t * t;

/**
 * Quartic easing in and out
 */
const easeInOutQuart: EasingFunction = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

/**
 * Quintic easing in
 */
const easeInQuint: EasingFunction = (t: number) => t * t * t * t * t;

/**
 * Quintic easing out
 */
const easeOutQuint: EasingFunction = (t: number) => 1 + --t * t * t * t * t;

/**
 * Quintic easing in and out
 */
const easeInOutQuint: EasingFunction = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

/**
 * Sine easing in
 */
const easeInSine: EasingFunction = (t: number) => 1 - Math.cos((t * Math.PI) / 2);

/**
 * Sine easing out
 */
const easeOutSine: EasingFunction = (t: number) => Math.sin((t * Math.PI) / 2);

/**
 * Sine easing in and out
 */
const easeInOutSine: EasingFunction = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Exponential easing in
 */
const easeInExpo: EasingFunction = (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));

/**
 * Exponential easing out
 */
const easeOutExpo: EasingFunction = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Exponential easing in and out
 */
const easeInOutExpo: EasingFunction = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

/**
 * Circular easing in
 */
const easeInCirc: EasingFunction = (t: number) => 1 - Math.sqrt(1 - t * t);

/**
 * Circular easing out
 */
const easeOutCirc: EasingFunction = (t: number) => Math.sqrt(1 - --t * t);

/**
 * Circular easing in and out
 */
const easeInOutCirc: EasingFunction = (t: number) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

/**
 * Back easing in
 */
const easeInBack: EasingFunction = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * Back easing out
 */
const easeOutBack: EasingFunction = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Back easing in and out
 */
const easeInOutBack: EasingFunction = (t: number) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

/**
 * Elastic easing in
 */
const easeInElastic: EasingFunction = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

/**
 * Elastic easing out
 */
const easeOutElastic: EasingFunction = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Elastic easing in and out
 */
const easeInOutElastic: EasingFunction = (t: number) => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

/**
 * Bounce easing out
 */
const easeOutBounce: EasingFunction = (t: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Bounce easing in
 */
const easeInBounce: EasingFunction = (t: number) => 1 - easeOutBounce(1 - t);

/**
 * Bounce easing in and out
 */
const easeInOutBounce: EasingFunction = (t: number) =>
  t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2;

/**
 * Collection of easing functions
 */
export const easing = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
};
