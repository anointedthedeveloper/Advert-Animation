import React from 'react';
import {useCurrentFrame} from '../frame';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

const RED = '#EF4444';
const RED_SOFT = '#FCA5A5';

const Cross: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Tick: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/**
 * A problem schools face, struck through, followed by a green "Fixed" tag.
 * Frames are local to the scene (honours the scene's TimeScale).
 */
export const Problem: React.FC<{text: string; at: number; fixAt: number; size?: number}> = ({text, at, fixAt, size = 30}) => {
  const f = useCurrentFrame();
  const a = prog(f, at, 12, ease.out);
  const struck = f >= fixAt - 6;
  const fix = prog(f, fixAt, 12, ease.back);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, opacity: a, transform: `translateY(${(1 - a) * -16}px)`}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: `${size * 0.28}px ${size * 0.6}px ${size * 0.28}px ${size * 0.3}px`,
          borderRadius: 999,
          background: 'rgba(239,68,68,0.16)',
          border: '1.5px solid rgba(239,68,68,0.5)',
          color: RED_SOFT,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '-0.005em',
          textDecoration: struck ? 'line-through' : 'none',
          textDecorationThickness: '2.5px',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{width: size * 1.15, height: size * 1.15, borderRadius: '50%', background: RED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <Cross size={size * 0.7} />
        </span>
        {text}
      </div>
      <span style={{color: C.mint, fontWeight: 800, fontSize: size * 1.1, opacity: fix}}>→</span>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: `${size * 0.28}px ${size * 0.6}px`,
          borderRadius: 999,
          background: C.primary,
          color: '#fff',
          fontWeight: 800,
          fontSize: size,
          whiteSpace: 'nowrap',
          opacity: Math.min(1, fix * 1.6),
          transform: `scale(${0.7 + 0.3 * fix})`,
          transformOrigin: 'left center',
        }}
      >
        <Tick size={size * 0.85} />
        Fixed
      </div>
    </div>
  );
};

/** A green label for scenes that show a ready-made strength rather than a fix. */
export const Strength: React.FC<{text: string; at: number; size?: number}> = ({text, at, size = 30}) => {
  const f = useCurrentFrame();
  const a = prog(f, at, 12, ease.back);
  return (
    <div style={{opacity: Math.min(1, a * 1.6), transform: `scale(${0.8 + 0.2 * a})`, transformOrigin: 'left center', display: 'inline-flex'}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: `${size * 0.28}px ${size * 0.7}px`,
          borderRadius: 999,
          background: C.primary,
          color: '#fff',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <Tick size={size * 0.85} />
        {text}
      </div>
    </div>
  );
};

/** One or two supporting lines that say HOW the problem is fixed. */
export const Explainer: React.FC<{text: string; at: number; width?: number; size?: number}> = ({text, at, width = 760, size = 34}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14, ease.out);
  return (
    <div style={{width, fontFamily: FONT, fontSize: size, lineHeight: 1.32, fontWeight: 500, color: 'rgba(241,245,249,0.9)', opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
      {text}
    </div>
  );
};
