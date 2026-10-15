import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, lerp, prog} from '../util';

export type Key = {f: number; x: number; y: number};

/** Mouse pointer following keyframes with eased travel, plus click ripples. */
export const Cursor: React.FC<{keys: Key[]; clicks?: number[]; opacityIn?: number}> = ({keys, clicks = [], opacityIn = 0}) => {
  const f = useCurrentFrame();
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = ease.inOut((f - a.f) / Math.max(1, b.f - a.f));
      x = lerp(a.x, b.x, t);
      y = lerp(a.y, b.y, t);
    } else if (f > b.f) {
      x = b.x;
      y = b.y;
    }
  }
  const op = prog(f, opacityIn, 8);
  const pressed = clicks.some((c) => f >= c && f < c + 4);
  return (
    <>
      {clicks.map((c, i) => {
        const t = prog(f, c, 16, ease.out);
        if (f < c || t >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 30,
              top: y - 30,
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '3px solid rgba(16,185,129,0.9)',
              transform: `scale(${0.3 + t * 1.1})`,
              opacity: 1 - t,
            }}
          />
        );
      })}
      <svg
        width={44}
        height={44}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: x - 4,
          top: y - 2,
          opacity: op,
          transform: `scale(${pressed ? 0.88 : 1})`,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
        }}
      >
        <path d="M5 3l14 8-6 2-3 6z" fill="#fff" stroke="#0F172A" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </>
  );
};
