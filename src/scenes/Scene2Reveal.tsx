import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LogoTile} from '../components/Mark';
import {KText} from '../components/KText';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

/** Local frame 0 = global frame 90 (3.0 s). */
export const Scene2Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const markIn = prog(f, 26, 22, ease.back);
  const flash = prog(f, 30, 6, ease.out) * (1 - prog(f, 36, 14, ease.out));
  const out = prog(f, 78, 12, ease.in);
  const sub = prog(f, 66, 18, ease.out);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + prog(f, 0, 96, ease.soft) * 0.04 + out * 0.25})`,
        opacity: 1 - out,
      }}
    >
      {/* soft light plate behind the mark so the green artwork always reads */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 330,
          top: 380 - 330,
          width: 660,
          height: 660,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(167,243,208,${0.2 * markIn + flash * 0.25}) 0%, rgba(167,243,208,0) 66%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960 - 190,
          top: 380 - 190,
          width: 380,
          height: 380,
          transform: `scale(${0.55 + markIn * 0.45})`,
          opacity: Math.min(1, markIn * 1.6),
        }}
      >
        <LogoTile size={380} sweepAt={44} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
        <KText
          align="center"
          size={150}
          start={36}
          stagger={5}
          lines={[[{t: 'Meet'}, {t: 'Exam', color: C.mint}, {t: 'Box.', color: C.mint}]]}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 836,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: '0.22em',
          color: C.mint,
          opacity: sub * 0.9,
          transform: `translateY(${(1 - sub) * 16}px)`,
        }}
      >
        BY ANOBYTE TECHNOLOGIES
      </div>
    </AbsoluteFill>
  );
};
