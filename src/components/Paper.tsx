import React from 'react';
import {C, FONT} from '../theme';
import {rng} from '../util';

export const PAPER_W = 500;
export const PAPER_H = 650;

/** A hand-marked examination script, drawn in code. */
export const Paper: React.FC<{seed: number}> = ({seed}) => {
  const r = rng(seed * 97 + 13);
  const lines = Array.from({length: 17}, () => 0.45 + r() * 0.5);
  const marks = Array.from({length: 6}, (_, i) => ({y: 190 + i * 62 + r() * 18, ok: r() > 0.45, x: 18 + r() * 16}));
  const score = 28 + Math.floor(r() * 55);
  return (
    <div
      style={{
        width: PAPER_W,
        height: PAPER_H,
        borderRadius: 6,
        background: seed % 2 ? '#F8FAFC' : '#F1F5F9',
        boxShadow: '0 18px 36px rgba(0,0,0,0.38), 0 2px 0 rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 44, top: 34, fontSize: 15, fontWeight: 800, letterSpacing: '0.18em', color: C.slate}}>
        EXAMINATION SCRIPT
      </div>
      <div style={{position: 'absolute', left: 44, top: 66, right: 150, height: 3, background: C.slate, opacity: 0.55}} />
      <div style={{position: 'absolute', left: 44, top: 86, fontSize: 13, color: C.slate, fontWeight: 600}}>Name</div>
      <div style={{position: 'absolute', left: 92, top: 100, width: 170 + r() * 80, height: 4, background: C.ink, opacity: 0.5, borderRadius: 2}} />
      <div style={{position: 'absolute', right: 34, top: 28, fontSize: 46, fontWeight: 600, fontStyle: 'italic', color: C.red, transform: 'rotate(-8deg)'}}>
        {score}
        <span style={{fontSize: 22}}>/100</span>
      </div>
      <svg width={80} height={64} style={{position: 'absolute', right: 26, top: 20}}>
        <ellipse cx={40} cy={32} rx={38} ry={26} fill="none" stroke={C.red} strokeWidth={3} transform="rotate(-8 40 32)" />
      </svg>
      {lines.map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 44,
            top: 160 + i * 28,
            width: (PAPER_W - 88) * w,
            height: 4,
            borderRadius: 2,
            background: C.slate,
            opacity: 0.4,
          }}
        />
      ))}
      {marks.map((m, i) => (
        <svg key={i} width={46} height={40} style={{position: 'absolute', left: m.x - 14, top: m.y}}>
          {m.ok ? (
            <path d="M6 22l10 11L40 6" stroke={C.red} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M8 6l28 28M36 6L8 34" stroke={C.red} strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
        </svg>
      ))}
    </div>
  );
};
