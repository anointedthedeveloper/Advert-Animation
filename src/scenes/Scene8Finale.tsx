import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LogoTile} from '../components/Mark';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

/**
 * Local frame 0 = global frame 834. The brand wipe runs 0-16; the lockup is fully built by global
 * frame ~870 (29.0 s) and holds until the final frame (900 = 30.0 s).
 */
export const Scene8Finale: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = prog(f, 0, 16, ease.inOut);
  const bg = prog(f, 8, 8, ease.out);
  const tile = prog(f, 12, 16, ease.back);
  const h1 = prog(f, 18, 14, ease.out);
  const tag = prog(f, 25, 14, ease.out);
  const cta = prog(f, 33, 14, ease.back);
  const foot = prog(f, 44, 14, ease.out);
  const hold = prog(f, 12, 54, ease.soft);
  const sweep = prog(f, 46, 18, ease.inOut);

  return (
    <AbsoluteFill>
      {/* wipe: dark-green panel crosses the frame, then the clean lockup stage is revealed */}
      <AbsoluteFill style={{background: C.deep, opacity: bg}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 1920, left: 0, transform: `translateX(${1920 - wipe * 3840}px)`, background: C.dark}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: C.mint}} />
      </div>

      <AbsoluteFill style={{transform: `scale(${1 + hold * 0.02})`, alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 96, opacity: Math.min(1, tile * 1.6), transform: `scale(${0.6 + 0.4 * tile})`}}>
          <LogoTile size={240} sweepAt={24} />
        </div>

        <div style={{position: 'absolute', top: 372, width: '100%', textAlign: 'center', fontFamily: FONT}}>
          <div style={{overflow: 'hidden', paddingBottom: 14}}>
            <div style={{fontSize: 150, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, transform: `translateY(${(1 - h1) * 120}%)`, opacity: Math.min(1, h1 * 3)}}>Exam Box.</div>
          </div>
          <div style={{overflow: 'hidden', paddingBottom: 12}}>
            <div style={{fontSize: 70, fontWeight: 600, color: C.mint, letterSpacing: '-0.02em', transform: `translateY(${(1 - tag) * 120}%)`, opacity: Math.min(1, tag * 3)}}>Smarter exams, instant results.</div>
          </div>
        </div>

        <div style={{position: 'absolute', top: 752, opacity: Math.min(1, cta * 2), transform: `scale(${0.8 + 0.2 * cta})`}}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '30px 72px',
              borderRadius: 999,
              background: C.primary,
              color: '#fff',
              fontFamily: FONT,
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              boxShadow: '0 22px 50px rgba(0,0,0,0.4), 0 0 0 2px rgba(167,243,208,0.35)',
            }}
          >
            Get Exam Box for your school.
            {sweep > 0 && sweep < 1 && (
              <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 150 - 40}%, rgba(255,255,255,0.35) ${sweep * 150 - 25}%, rgba(255,255,255,0) ${sweep * 150 - 10}%)`}} />
            )}
          </div>
        </div>

        <div style={{position: 'absolute', bottom: 54, fontFamily: FONT, fontSize: 28, fontWeight: 500, color: 'rgba(241,245,249,0.72)', letterSpacing: '0.02em', opacity: foot, transform: `translateY(${(1 - foot) * 14}px)`}}>
          © 2026 Anobyte Technologies
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
