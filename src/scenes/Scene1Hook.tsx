import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Paper, PAPER_H, PAPER_W} from '../components/Paper';
import {KText} from '../components/KText';
import {DISSOLVE_LEN, DISSOLVE_START, STACK} from '../components/PaperDissolve';
import {ease, lerp, prog, rng} from '../util';

const COUNT = 12;
const LAND0 = 6;
const STEP = 3;
const papers = (() => {
  const r = rng(7);
  return Array.from({length: COUNT}, (_, i) => ({
    i,
    rot: (r() - 0.5) * 9,
    dx: (r() - 0.5) * 34,
    dy: -i * 9,
    land: LAND0 + i * STEP,
    fromX: (r() - 0.5) * 240,
  }));
})();

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
  const push = 1 + prog(f, 0, 90, ease.soft) * 0.07;

  const p = prog(f, DISSOLVE_START, DISSOLVE_LEN, ease.inOut);
  const h = Math.max(0, Math.min(1.2, (p - 0.18) / 0.62));
  const maskFrac = h * 100;
  const left = STACK.cx - 290;
  return (
    <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${push})`, transformOrigin: '60% 55%'}}>
      <div style={{position: 'absolute', left: 110, top: 340}}>
        <KText
          size={110}
          start={9}
          stagger={4}
          exitAt={DISSOLVE_START + 6}
          lines={[[{t: 'Marking'}, {t: 'exams'}], [{t: 'takes'}, {t: 'days.', color: '#A7F3D0'}]]}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left,
          top: 0,
          width: 580,
          height: 1080,
          WebkitMaskImage:
            p > 0
              ? `linear-gradient(90deg, transparent ${maskFrac}%, #000 ${maskFrac + 7}%)`
              : undefined,
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
