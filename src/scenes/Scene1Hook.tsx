import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {Paper, PAPER_H, PAPER_W} from '../components/Paper';
import {DISSOLVE_START, STACK, dissolvedFraction} from '../components/PaperDissolve';
import {C, FONT} from '../theme';
import {ease, lerp, prog, rng} from '../util';
import timing from '../timing.json';

const RED = '#EF4444';
const RED_SOFT = '#FCA5A5';

/** The problems, in the words a school would use. `hot` is the phrase that hurts. */
const ROWS: {before: string; hot: string; after: string}[] = [
  {before: '', hot: 'Marking takes days.', after: ''},
  {before: 'Report cards and broadsheets ', hot: 'compiled by hand.', after: ''},
  {before: 'Candidates face CBT ', hot: 'for the first time on exam day.', after: ''},
  {before: 'Cyber cafés ', hot: 'cost money', after: ' and are hard to supervise.'},
];

const papers = (() => {
  const r = rng(7);
  return timing.paperLandings.map((land, i) => ({
    i,
    rot: (r() - 0.5) * 9,
    dx: (r() - 0.5) * 34,
    dy: -i * 9,
    land,
    fromX: (r() - 0.5) * 240,
  }));
})();

/** Scene 1: "Sound familiar?" Four problems pile up as a stack of scripts grows, then everything dissolves. */
export const Scene1Hook: React.FC = () => {
  const f = useCurrentFrame();

  // each landing gives the whole frame a short, decaying shake
  let shakeX = 0;
  let shakeY = 0;
  for (const p of papers) {
    const dt = f - (p.land + 6);
    if (dt >= 0 && dt < 8) {
      const a = (1 - dt / 8) * 7;
      shakeX += Math.sin(dt * 2.7 + p.i) * a * 0.5;
      shakeY += Math.cos(dt * 3.3 + p.i) * a;
    }
  }
  const push = 1 + prog(f, 0, DISSOLVE_START, ease.soft) * 0.06;
  const exit = prog(f, DISSOLVE_START - 10, 10, ease.in);

  const h = dissolvedFraction(f);
  const maskFrac = h * 100;
  const left = STACK.cx - 290;
  const kick = prog(f, 3, 12, ease.out);

  return (
    <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${push})`, transformOrigin: '65% 55%'}}>
      <div style={{position: 'absolute', left: 110, top: 88, opacity: kick * (1 - exit), transform: `translateY(${(1 - kick) * -14}px)`, fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '0.22em', color: RED_SOFT}}>
        SOUND FAMILIAR?
      </div>

      <div style={{position: 'absolute', left: 110, top: 160, width: 1060, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: FONT, opacity: 1 - exit, transform: `translateX(${-exit * 60}px)`}}>
        {ROWS.map((row, i) => {
          const at = timing.problemRows[i];
          const a = prog(f, at, 14, ease.out);
          const pop = prog(f, at + 4, 12, ease.back);
          const flash = prog(f, at, 4) * (1 - prog(f, at + 4, 18));
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '20px 30px 20px 22px',
                borderRadius: 24,
                background: `rgba(239,68,68,${0.1 + flash * 0.22})`,
                border: '1.5px solid rgba(239,68,68,0.42)',
                opacity: a,
                transform: `translateX(${(1 - a) * -120}px)`,
              }}
            >
              <span style={{width: 70, height: 70, borderRadius: '50%', background: RED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transform: `scale(${pop})`}}>
                <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </span>
              <span style={{fontSize: 58, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em'}}>
                {row.before}
                <span style={{color: RED_SOFT}}>{row.hot}</span>
                {row.after}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left,
          top: 0,
          width: 580,
          height: 1080,
          WebkitMaskImage: h > 0 ? `linear-gradient(90deg, transparent ${maskFrac}%, #000 ${maskFrac + 7}%)` : undefined,
        }}
      >
        {papers.map((pp) => {
          const t = prog(f, pp.land - 9, 9, ease.in);
          const bounce = f >= pp.land ? Math.max(0, Math.sin((f - pp.land) * 1.1) * 7 * Math.exp(-(f - pp.land) * 0.28)) : 0;
          const y = lerp(-900, pp.dy, t) - bounce;
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
