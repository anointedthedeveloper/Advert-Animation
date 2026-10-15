import React from 'react';
import {C, FONT} from '../theme';
import {MarkImg} from './Mark';

/** Fictional school crest used throughout the mock-ups (Greenfield Academy is not a real client). */
export const Crest: React.FC<{size: number; dark?: boolean}> = ({size, dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 3l17 6v13c0 11-7 19-17 23C14 41 7 33 7 22V9z" fill={dark ? C.dark : C.white} />
    <path d="M24 3l17 6v13c0 11-7 19-17 23C14 41 7 33 7 22V9z" fill="none" stroke={dark ? C.mint : C.primary} strokeWidth="2" />
    <text x="24" y="29" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="16" fill={dark ? C.white : C.dark}>
      GA
    </text>
  </svg>
);

export const Dot: React.FC<{color: string; size?: number; pulse?: number}> = ({color, size = 10, pulse = 0}) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: pulse ? `0 0 0 ${pulse * 7}px rgba(16,185,129,${0.28 * (1 - pulse)})` : undefined,
    }}
  />
);

/** Small rounded status chip. */
export const Chip: React.FC<{
  children: React.ReactNode;
  bg: string;
  fg: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, bg, fg, size = 18, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: `${size * 0.3}px ${size * 0.7}px`,
      borderRadius: 999,
      background: bg,
      color: fg,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

export const Logo36: React.FC<{size?: number}> = ({size = 36}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <MarkImg size={size * 0.82} />
  </div>
);

export const DeviceFrame: React.FC<{
  kind: 'laptop' | 'tablet' | 'phone' | 'desktop';
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({kind, w, h, children}) => {
  const bezel = kind === 'phone' ? 12 : kind === 'tablet' ? 14 : 12;
  const radius = kind === 'phone' ? 34 : kind === 'tablet' ? 26 : 18;
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0B1220',
          borderRadius: radius,
          padding: bezel,
          boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 0 2px #1E293B inset',
        }}
      >
        <div style={{width: '100%', height: '100%', borderRadius: radius - bezel + 4, overflow: 'hidden', position: 'relative', background: C.deep}}>
          {children}
        </div>
      </div>
      {kind === 'laptop' && (
        <div style={{position: 'absolute', left: -28, right: -28, bottom: -18, height: 18, background: 'linear-gradient(#CBD5E1,#94A3B8)', borderRadius: '2px 2px 18px 18px'}} />
      )}
      {kind === 'desktop' && (
        <>
          <div style={{position: 'absolute', left: w / 2 - 14, bottom: -34, width: 28, height: 34, background: '#94A3B8'}} />
          <div style={{position: 'absolute', left: w / 2 - 66, bottom: -44, width: 132, height: 12, borderRadius: 8, background: '#CBD5E1'}} />
        </>
      )}
      {kind === 'phone' && (
        <div style={{position: 'absolute', left: w / 2 - 22, top: 8, width: 44, height: 8, borderRadius: 6, background: '#020617'}} />
      )}
    </div>
  );
};
