import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {LogoTile} from '../components/Mark';
import {KText} from '../components/KText';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

/**
 * Local frame 0 = dissolveStart + 34. The logo pops as the particles from scene 1 arrive, then the scene says
 * who we are in one plain sentence.
 */
export const Scene2Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const markIn = prog(f, 14, 22, ease.back);
  const flash = prog(f, 18, 6, ease.out) * (1 - prog(f, 24, 14, ease.out));
  const out = prog(f, 78, 12, ease.in);
  const what = prog(f, 44, 16, ease.out);
  const by = prog(f, 58, 16, ease.out);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + prog(f, 0, 96, ease.soft) * 0.04 + out * 0.25})`,
        opacity: 1 - out,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 960 - 300,
          top: 330 - 300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(167,243,208,${0.2 * markIn + flash * 0.25}) 0%, rgba(167,243,208,0) 66%)`,
        }}
      />
      <div style={{position: 'absolute', left: 960 - 150, top: 330 - 150, width: 300, height: 300, transform: `scale(${0.55 + markIn * 0.45})`, opacity: Math.min(1, markIn * 1.6)}}>
        <LogoTile size={300} sweepAt={32} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 508}}>
        <KText align="center" size={150} start={26} stagger={5} lines={[[{t: 'Meet'}, {t: 'Exam', color: C.mint}, {t: 'Box.', color: C.mint}]]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 712,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.22,
          letterSpacing: '-0.015em',
          color: '#fff',
          opacity: what,
          transform: `translateY(${(1 - what) * 20}px)`,
        }}
      >
        The offline computer-based testing system
        <br />
        for schools and exam centres.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 912,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: C.mint,
          opacity: by * 0.95,
          transform: `translateY(${(1 - by) * 14}px)`,
        }}
      >
        BY AREMU TECH EAZY SOLUTIONS
      </div>
    </AbsoluteFill>
  );
};
