import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, W, H} from '../theme';
import {prog} from '../util';

/** Persistent deep-forest background. A fine grid fades in after the paper stack dissolves. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const grid = prog(f, 70, 40) * 0.5;
  const drift = (f * 0.25) % 80;
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1400px 800px at 72% 18%, ${C.dark} 0%, rgba(6,78,59,0) 70%), radial-gradient(900px 600px at 8% 100%, rgba(6,78,59,0.55) 0%, rgba(6,78,59,0) 70%)`,
        }}
      />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: grid}}>
        <defs>
          <pattern id="g" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform={`translate(${-drift} ${-drift})`}>
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(167,243,208,0.07)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#g)" />
      </svg>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}}
      />
    </AbsoluteFill>
  );
};
