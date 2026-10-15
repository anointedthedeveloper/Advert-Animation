import React, {useLayoutEffect, useRef} from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {C, W, H} from '../theme';
import {lerp, rng} from '../util';

/** Geometry shared by the paper stack (scene 1) and the particle layer that replaces it. */
export const STACK = {cx: 1400, cy: 560, cols: 26, rows: 32, tile: 22};
export const DISSOLVE_START = 56;
/** Frames over which the dissolve wave crosses the stack from left to right. */
export const WAVE = 20;
const FLIGHT = 42; // frames each particle takes from the paper to the logo
const TARGET = {x: 960, y: 380};
const INK = ['#F1F5F9', '#F1F5F9', '#F8FAFC', '#F1F5F9', '#94A3B8', '#EF4444', '#F1F5F9', '#CBD5E1'];

/** Fraction (0..1.2) of the stack width that has already dissolved at frame f. */
export const dissolvedFraction = (f: number) => Math.max(0, Math.min(1.2, ((f - DISSOLVE_START) / WAVE - 0.18) / 0.62));

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Accelerates away from the paper, then settles gently into the logo. No mid-flight stall.
const flight = Easing.bezier(0.55, 0.05, 0.25, 1);

const tiles = (() => {
  const r = rng(2026);
  const out: {x: number; y: number; start: number; cx: number; cy: number; tx: number; ty: number; s: number; ink: string; rot: number}[] = [];
  const {cols, rows, tile, cx, cy} = STACK;
  for (let c = 0; c < cols; c++) {
    for (let rr = 0; rr < rows; rr++) {
      const x = cx - (cols * tile) / 2 + c * tile;
      const y = cy - (rows * tile) / 2 + rr * tile - 10;
      const d = (c / cols) * 0.62 + r() * 0.18;
      const dx = -30 + r() * 200;
      const dy = -(40 + r() * 240);
      out.push({
        x,
        y,
        start: DISSOLVE_START + d * WAVE + r() * 3,
        // control point: the particle swings through its "drift" position on the way to the logo
        cx: x + dx * 2,
        cy: y + dy * 2,
        tx: TARGET.x + (r() - 0.5) * 70,
        ty: TARGET.y + (r() - 0.5) * 70,
        s: 0.55 + r() * 0.5,
        ink: INK[Math.floor(r() * INK.length)],
        rot: (r() - 0.5) * 540,
      });
    }
  }
  return out;
})();

const posAt = (t: (typeof tiles)[number], f: number) => {
  const raw = clamp01((f - t.start) / FLIGHT);
  const k = flight(raw);
  const a = (1 - k) * (1 - k);
  const b = 2 * (1 - k) * k;
  const c = k * k;
  return {x: a * t.x + b * t.cx + c * t.tx, y: a * t.y + b * t.cy + c * t.ty, k, raw};
};

/**
 * Paper fibres break into particles and sweep into the logo position in a single continuous motion.
 * Drawn on a canvas (cheap, smooth in the preview) with a short motion-blur trail per particle.
 * Uses the global frame.
 */
export const PaperDissolve: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const active = f >= DISSOLVE_START && f <= 130;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!active) return;
    const SAMPLES = [2.1, 1.4, 0.7, 0]; // sub-frame offsets, oldest first
    const ALPHAS = [0.14, 0.24, 0.42, 1];
    for (const t of tiles) {
      if (f < t.start) continue;
      for (let j = 0; j < SAMPLES.length; j++) {
        const tf = f - SAMPLES[j];
        if (tf < t.start) continue;
        const p = posAt(t, tf);
        if (p.raw >= 1 && tf > t.start + FLIGHT + 1) continue;
        const grow = 1 - 0.78 * p.k * p.k;
        const size = STACK.tile * t.s * grow;
        const toGreen = clamp01((p.raw - 0.12) / 0.4);
        const toMint = clamp01((p.raw - 0.7) / 0.3);
        const col = toMint > 0 ? mix(C.emerald, C.mint, toMint) : mix(t.ink, C.emerald, toGreen);
        const fade = 1 - clamp01((p.raw - 0.88) / 0.12);
        ctx.globalAlpha = ALPHAS[j] * fade;
        ctx.fillStyle = col;
        ctx.setTransform(1, 0, 0, 1, p.x + size / 2, p.y + size / 2);
        ctx.rotate(((p.raw * t.rot) * Math.PI) / 180);
        ctx.fillRect(-size / 2, -size / 2, size, size);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }, [f, active]);

  if (!active) return null;
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none'}} />;
};
