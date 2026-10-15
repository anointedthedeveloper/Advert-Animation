import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {LogoTile} from '../components/Mark';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

export const COMPANY = 'Aremu Tech Eazy Solutions';
export const WEBSITE = 'aremutecheazysolutions.com';
export const PHONES = ['0901 647 1351', '0902 907 4772'];

const Globe: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const Phone: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

/**
 * Local frame 0 = global frame 810 (27.0 s). The brand wipe runs 0-16; the lockup is complete by about
 * frame 52 (28.7 s) and every element then holds for the last ~1.3 s.
 */
export const Scene8Finale: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = prog(f, 0, 16, ease.inOut);
  const bg = prog(f, 8, 8, ease.out);
  const tile = prog(f, 8, 16, ease.back);
  const h1 = prog(f, 12, 14, ease.out);
  const tag = prog(f, 17, 14, ease.out);
  const cta = prog(f, 22, 14, ease.back);
  const card = prog(f, 30, 14, ease.out);
  const foot = prog(f, 40, 12, ease.out);
  const hold = prog(f, 8, 82, ease.soft);
  const sweep = prog(f, 38, 18, ease.inOut);

  return (
    <AbsoluteFill>
      {/* wipe: dark-green panel crosses the frame, then the clean lockup stage is revealed */}
      <AbsoluteFill style={{background: C.deep, opacity: bg}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 1920, left: 0, transform: `translateX(${1920 - wipe * 3840}px)`, background: C.dark}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: C.mint}} />
      </div>

      <AbsoluteFill style={{transform: `scale(${1 + hold * 0.015})`, alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 54, opacity: Math.min(1, tile * 1.6), transform: `scale(${0.6 + 0.4 * tile})`}}>
          <LogoTile size={190} sweepAt={20} />
        </div>

        <div style={{position: 'absolute', top: 262, width: '100%', textAlign: 'center', fontFamily: FONT}}>
          <div style={{overflow: 'hidden', paddingBottom: 12}}>
            <div style={{fontSize: 132, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, transform: `translateY(${(1 - h1) * 120}%)`, opacity: Math.min(1, h1 * 3)}}>Exam Box.</div>
          </div>
          <div style={{overflow: 'hidden', paddingBottom: 10}}>
            <div style={{fontSize: 60, fontWeight: 600, color: C.mint, letterSpacing: '-0.02em', transform: `translateY(${(1 - tag) * 120}%)`, opacity: Math.min(1, tag * 3)}}>Smarter exams, instant results.</div>
          </div>
        </div>

        <div style={{position: 'absolute', top: 508, opacity: Math.min(1, cta * 2), transform: `scale(${0.8 + 0.2 * cta})`}}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '26px 68px',
              borderRadius: 999,
              background: C.primary,
              color: '#fff',
              fontFamily: FONT,
              fontSize: 46,
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

        <div
          style={{
            position: 'absolute',
            top: 672,
            width: 1180,
            borderRadius: 30,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(167,243,208,0.3)',
            padding: '28px 40px',
            fontFamily: FONT,
            textAlign: 'center',
            opacity: card,
            transform: `translateY(${(1 - card) * 40}px)`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#fff', fontSize: 58, fontWeight: 800, letterSpacing: '-0.02em'}}>
            <Globe size={46} />
            {WEBSITE}
          </div>
          <div style={{marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, color: C.mint, fontSize: 46, fontWeight: 700, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums'}}>
            <Phone size={40} />
            <span>{PHONES[0]}</span>
            <span style={{opacity: 0.5}}>·</span>
            <span>{PHONES[1]}</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: 42, fontFamily: FONT, fontSize: 28, fontWeight: 500, color: 'rgba(241,245,249,0.72)', letterSpacing: '0.02em', opacity: foot, transform: `translateY(${(1 - foot) * 14}px)`}}>
          © 2026 {COMPANY}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
