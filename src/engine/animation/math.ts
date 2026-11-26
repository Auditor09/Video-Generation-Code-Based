/**
 * Deterministic Animation Mathematics
 * Cubic Bezier easing, damped spring solver, squash-and-stretch, and seeded noise.
 * Zero Math.random() — purely deterministic for Remotion frame-by-frame rendering.
 */

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Evaluates a 1D cubic Bezier easing curve at progress x in [0, 1].
 */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number, x: number): number {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  // Newton-Raphson solve for t given x
  let t = clamp(x, 0, 1);
  for (let i = 0; i < 6; i++) {
    const err = sampleX(t) - x;
    const d = sampleDerivX(t);
    if (Math.abs(err) < 1e-5 || Math.abs(d) < 1e-5) break;
    t = clamp(t - err / d, 0, 1);
  }
  return ((ay * t + by) * t + cy) * t;
}

/**
 * Closed-form deterministic damped harmonic spring evaluated at elapsed time t (seconds).
 * Transitions smoothly from 0 to 1 with natural overshoot when dampingRatio < 1.
 */
export function evaluateSpring(
  t: number,
  stiffness = 180,
  damping = 14,
  mass = 1
): number {
  if (t <= 0) return 0;
  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t);
    const cos = Math.cos(omegaD * t);
    const sin = Math.sin(omegaD * t);
    return 1 - decay * (cos + ((zeta * omega0) / omegaD) * sin);
  }
  const decay = Math.exp(-omega0 * t);
  return 1 - decay * (1 + omega0 * t);
}

/**
 * Deterministic multi-octave pseudo-random noise in [-1, 1] for organic micro-motion.
 */
export function deterministicNoise(seed: number, t: number): number {
  const s1 = Math.sin(t * 2.17 + seed * 13.37);
  const s2 = Math.sin(t * 5.43 + seed * 7.11) * 0.5;
  const s3 = Math.sin(t * 11.89 + seed * 3.73) * 0.25;
  return (s1 + s2 + s3) / 1.75;
}

/**
 * Deterministic automatic blinking curve in [0, 1] (0 = open, 1 = closed).
 */
export function evaluateDeterministicBlink(t: number, period = 3.6): number {
  const phase = ((t % period) + period) % period;
  // Quick crisp 140ms blink near the end of each cycle
  const blinkStart = period - 0.16;
  if (phase < blinkStart) return 0;
  const u = (phase - blinkStart) / 0.16;
  return Math.sin(u * Math.PI);
}
