import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {Paper, PAPER_H, PAPER_W} from '../components/Paper';
import {DISSOLVE_START, STACKS, dissolvedFraction} from '../components/PaperDissolve';
import {C, FONT} from '../theme';
import {ease, lerp, prog, rng} from '../util';
import {useIsPortrait} from '../layout';
import timing from '../timing.json';

const RED = '#EF4444';
const RED_SOFT = '#FCA5A5';

/** Each problem a school lives with, and the plain-English way Exam Box fixes it. */
const ROWS = [
  {
    pt: 'Exams need the internet',
    pd: 'Data costs money, and a weak connection can stop an exam.',
    ft: 'Fully offline. No data bills.',
    fd: 'One school PC runs it over your own network. No internet needed.',
  },
  {
    pt: 'Marking takes days',
    pd: 'Teachers mark every script by hand.',
    ft: 'Instant marking',
    fd: 'Marked the moment a candidate submits. Scores out of 100.',
  },
  {
    pt: 'Report cards compiled by hand',
    pd: 'Results are copied into broadsheets one by one.',
    ft: 'Branded report cards',
    fd: 'PDF report cards with your school logo, plus Excel export.',
  },
  {
    pt: 'Cyber cafés cost money',
    pd: 'And they are hard to supervise.',
    ft: 'Watch every candidate live',
    fd: 'See progress, connection and battery while they write.',
  },
];

const papers = (() => {
  const r = rng(7);
  return timing.paperLandings.map((land, i) => ({
    i,
    rot: (r() - 0.5) * 9,
    dx: (r() - 0.5) * 34,
    dy: -i * 8,
    land,
    fromX: (r() - 0.5) * 240,
  }));
})();

const Tick: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const Cross: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.8} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const Row: React.FC<{i: number; P: boolean}> = ({i, P}) => {
  const f = useCurrentFrame();
  const row = ROWS[i];
  const at = timing.problemRows[i];
  const fixAt = timing.fixRows[i];
  const a = prog(f, at, 18, ease.out);
  const pop = prog(f, at + 4, 14, ease.back);
  const flash = prog(f, at, 4) * (1 - prog(f, at + 4, 20));
  const q = prog(f, fixAt, 22, ease.inOut);
  const fixed = q >= 0.5;
  const angle = q < 0.5 ? q * 180 : q * 180 - 180;
  const sweep = prog(f, fixAt + 10, 22, ease.inOut);
  const iconPop = fixed ? prog(f, fixAt + 11, 12, ease.back) : pop;
  return (
    <div
      style={{
        perspective: 1400,
        opacity: a,
        transform: `translateX(${(1 - a) * (P ? -80 : -140)}px)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: P ? 20 : 26,
          padding: P ? '22px 26px 22px 22px' : '18px 30px 18px 24px',
          borderRadius: 26,
          overflow: 'hidden',
          background: fixed ? 'rgba(22,163,74,0.20)' : `rgba(239,68,68,${0.10 + flash * 0.2})`,
          border: `1.5px solid ${fixed ? 'rgba(167,243,208,0.55)' : 'rgba(239,68,68,0.45)'}`,
          boxShadow: fixed ? '0 18px 40px rgba(0,0,0,0.3)' : 'none',
          transform: `rotateX(${angle}deg)`,
          transformOrigin: 'center',
        }}
      >
        <span
          style={{
            width: P ? 64 : 72,
            height: P ? 64 : 72,
            borderRadius: '50%',
            background: fixed ? C.primary : RED,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            transform: `scale(${iconPop})`,
          }}
        >
          {fixed ? <Tick size={P ? 36 : 42} /> : <Cross size={P ? 36 : 42} />}
        </span>
        <div style={{minWidth: 0}}>
          <div style={{fontFamily: FONT, fontSize: P ? 46 : 50, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: fixed ? C.mint : RED_SOFT}}>
            {fixed ? row.ft : row.pt}
          </div>
          <div style={{fontFamily: FONT, fontSize: P ? 27 : 28, fontWeight: 500, lineHeight: 1.3, marginTop: 6, color: fixed ? 'rgba(241,245,249,0.92)' : 'rgba(241,245,249,0.74)'}}>
            {fixed ? row.fd : row.pd}
          </div>
        </div>
        {sweep > 0 && sweep < 1 && (
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(167,243,208,0) ${sweep * 160 - 50}%, rgba(167,243,208,0.35) ${sweep * 160 - 36}%, rgba(167,243,208,0) ${sweep * 160 - 22}%)`}} />
        )}
      </div>
    </div>
  );
};

/**
 * Scene 1: "Sound familiar?" Four problems pile up as a stack of scripts grows, each with a plain explanation.
 * Then every card flips to its fix, and everything dissolves into particles.
 */
export const Scene1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const P = useIsPortrait();
  const STACK = STACKS[P ? 'portrait' : 'landscape'];

  // each landing gives the whole frame a short, decaying shake
  let shakeX = 0;
  let shakeY = 0;
  for (const p of papers) {
    const dt = f - (p.land + 6);
    if (dt >= 0 && dt < 8) {
      const a = (1 - dt / 8) * 6;
      shakeX += Math.sin(dt * 2.7 + p.i) * a * 0.5;
      shakeY += Math.cos(dt * 3.3 + p.i) * a;
    }
  }
  const push = 1 + prog(f, 0, DISSOLVE_START, ease.soft) * 0.05;
  const exit = prog(f, DISSOLVE_START - 10, 10, ease.in);

  const h = dissolvedFraction(f);
  const maskFrac = h * 100;
  const left = STACK.cx - 290;
  const kick = prog(f, 6, 14, ease.out);
  const toFix = prog(f, timing.fixRows[0] - 4, 14, ease.out);

  return (
    <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${push})`, transformOrigin: P ? '50% 70%' : '65% 55%'}}>
      <div style={{position: 'absolute', left: P ? 60 : 110, top: P ? 168 : 80, opacity: kick * (1 - exit), transform: `translateY(${(1 - kick) * -14}px)`, fontFamily: FONT, fontWeight: 800, fontSize: P ? 38 : 40, letterSpacing: '0.22em', color: toFix > 0.5 ? C.mint : RED_SOFT}}>
        {toFix > 0.5 ? 'EXAM BOX FIXES ALL FOUR' : 'SOUND FAMILIAR?'}
      </div>

      <div style={{position: 'absolute', left: P ? 60 : 110, top: P ? 236 : 148, width: P ? 960 : 1090, display: 'flex', flexDirection: 'column', gap: P ? 18 : 16, opacity: 1 - exit, transform: `translateX(${-exit * 60}px)`}}>
        {ROWS.map((_, i) => (
          <Row key={i} i={i} P={P} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left,
          top: 0,
          width: 580,
          height: P ? 1920 : 1080,
          WebkitMaskImage: h > 0 ? `linear-gradient(90deg, transparent ${maskFrac}%, #000 ${maskFrac + 7}%)` : undefined,
        }}
      >
        {papers.map((pp) => {
          const t = prog(f, pp.land - 9, 9, ease.in);
          const bounce = f >= pp.land ? Math.max(0, Math.sin((f - pp.land) * 1.1) * 7 * Math.exp(-(f - pp.land) * 0.28)) : 0;
          const y = lerp(P ? -150 : -900, pp.dy, t) - bounce;
          return (
            <div
              key={pp.i}
              style={{
                position: 'absolute',
                left: 290 - PAPER_W / 2 + pp.dx + (1 - t) * pp.fromX,
                top: STACK.cy - PAPER_H / 2 + y,
                transform: `rotate(${pp.rot * (0.4 + 0.6 * t)}deg)`,
                opacity: f >= pp.land - 9 ? 1 : 0,
              }}
            >
              <Paper seed={pp.i + 1} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
