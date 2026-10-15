import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {ease, lerp, prog, rng} from '../util';

/** Geometry shared by the paper stack (scene 1) and the particle layer that replaces it. */
export const STACK = {cx: 1400, cy: 560, cols: 26, rows: 32, tile: 22};
export const DISSOLVE_START = 56;
export const DISSOLVE_LEN = 32;
const BRIDGE_START = 88;
const TARGET = {x: 960, y: 400};
const INK = ['#F1F5F9', '#F1F5F9', '#F8FAFC', '#F1F5F9', '#94A3B8', '#EF4444', '#F1F5F9', '#CBD5E1'];

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
};

const tiles = (() => {
  const r = rng(2026);
  const out: {x: number; y: number; d: number; dx: number; dy: number; b: number; s: number; ink: string}[] = [];
  const {cols, rows, tile, cx, cy} = STACK;
  for (let c = 0; c < cols; c++) {
    for (let rr = 0; rr < rows; rr++) {
      out.push({
        x: cx - (cols * tile) / 2 + c * tile,
        y: cy - (rows * tile) / 2 + rr * tile - 10,
        d: (c / cols) * 0.62 + r() * 0.18,
        dx: -30 + r() * 200,
        dy: -(40 + r() * 240),
        b: r() * 10,
        s: 0.55 + r() * 0.5,
        ink: INK[Math.floor(r() * INK.length)],
      });
    }
  }
  return out;
})();

/** Paper fibres break into particles, drift up, then are drawn into the logo position. Uses the global frame. */
export const PaperDissolve: React.FC = () => {
  const f = useCurrentFrame();
  if (f < DISSOLVE_START || f > 132) return null;
  const p = prog(f, DISSOLVE_START, DISSOLVE_LEN, ease.inOut);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {tiles.map((t, i) => {
        if (p <= t.d) return null;
        const driftT = prog(f, DISSOLVE_START + t.d * DISSOLVE_LEN * 0.8, 16, ease.out);
        const bridgeT = prog(f, BRIDGE_START + t.b, 26, ease.in);
        if (bridgeT >= 1) return null;
        const x0 = t.x + t.dx * driftT;
        const y0 = t.y + t.dy * driftT;
        const x = lerp(x0, TARGET.x, bridgeT);
        const y = lerp(y0, TARGET.y, bridgeT);
        const size = STACK.tile * t.s * (1 - bridgeT * 0.8);
        const toGreen = prog(f, DISSOLVE_START + t.d * DISSOLVE_LEN * 0.8 + 8, 26, ease.inOut);
        const col = bridgeT > 0 ? mix(C.emerald, C.mint, bridgeT) : mix(t.ink, C.emerald, toGreen);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: size,
              height: size,
              borderRadius: 2,
              background: col,
              opacity: 1 - bridgeT * 0.35,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${driftT * t.dx * 1.4}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};
