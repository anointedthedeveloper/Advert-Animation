import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {useIsPortrait} from '../layout';
import {LogoTile} from '../components/Mark';
import {KText} from '../components/KText';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

const CHIPS = ['Fully offline', 'Instant marking', 'Live monitoring', 'Report cards + Excel'];

/**
 * Local frame 0 = dissolveStart + 34. The logo pops as the particles from scene 1 arrive, then the scene says who we
 * are in one plain sentence and lists the four fixes in one line.
 */
export const Scene2Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const P = useIsPortrait();
  const cx = P ? 540 : 960;
  const cy = P ? 520 : 300;
  const markIn = prog(f, 14, 22, ease.back);
  const flash = prog(f, 18, 6, ease.out) * (1 - prog(f, 24, 14, ease.out));
  const out = prog(f, 116, 12, ease.in);
  const what = prog(f, 48, 18, ease.out);
  const by = prog(f, 100, 16, ease.out);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + prog(f, 0, 130, ease.soft) * 0.035 + out * 0.25})`,
        opacity: 1 - out,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: cx - 300,
          top: cy - 300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(167,243,208,${0.2 * markIn + flash * 0.25}) 0%, rgba(167,243,208,0) 66%)`,
        }}
      />
      <div style={{position: 'absolute', left: cx - 130, top: cy - 130, width: 260, height: 260, transform: `scale(${0.55 + markIn * 0.45})`, opacity: Math.min(1, markIn * 1.6)}}>
        <LogoTile size={260} sweepAt={32} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: P ? 690 : 460}}>
        <KText align="center" size={P ? 120 : 140} start={26} stagger={5} lines={[[{t: 'Meet'}, {t: 'Exam', color: C.mint}, {t: 'Box.', color: C.mint}]]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: P ? 70 : 0,
          right: P ? 70 : 0,
          top: P ? 890 : 650,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: P ? 48 : 48,
          fontWeight: 600,
          lineHeight: 1.22,
          letterSpacing: '-0.015em',
          color: '#fff',
          opacity: what,
          transform: `translateY(${(1 - what) * 20}px)`,
        }}
      >
        {P ? (
          <>The <b style={{color: C.mint, fontWeight: 800}}>fully offline</b> computer-based testing system for schools and exam centres.</>
        ) : (
          <>The <b style={{color: C.mint, fontWeight: 800}}>fully offline</b> computer-based testing<br />system for schools and exam centres.</>
        )}
      </div>

      {/* the four fixes, in one line */}
      <div
        style={{
          position: 'absolute',
          left: P ? 50 : 0,
          right: P ? 50 : 0,
          top: P ? 1190 : 820,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: P ? 16 : 18,
          fontFamily: FONT,
        }}
      >
        {CHIPS.map((c, i) => {
          const p = prog(f, 66 + i * 8, 14, ease.back);
          return (
            <div
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: P ? '14px 26px 14px 18px' : '14px 26px 14px 18px',
                borderRadius: 999,
                background: 'rgba(22,163,74,0.9)',
                color: '#fff',
                fontWeight: 800,
                fontSize: P ? 34 : 30,
                whiteSpace: 'nowrap',
                opacity: Math.min(1, p * 1.6),
                transform: `translateY(${(1 - p) * 24}px) scale(${0.85 + 0.15 * p})`,
                boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
              }}
            >
              <svg width={P ? 34 : 30} height={P ? 34 : 30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {c}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: P ? 1440 : 960,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: P ? 28 : 28,
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
