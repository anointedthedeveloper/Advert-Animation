import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useCurrentFrame} from '../frame';
import {KText} from '../components/KText';
import {Cursor} from '../components/Cursor';
import {Chip, Logo36} from '../components/ui';
import {Check} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, prog, rng} from '../util';
import {Problem, Strength, Explainer} from '../components/Caption';

const CX = 1390;
const CY = 540;
const CW = 820;
const CH = 780;
const SCORE = 86;
const CORRECT = 43;
const WRONG = 7;

const confetti = (() => {
  const r = rng(86);
  return Array.from({length: 46}, () => ({
    a: r() * Math.PI * 2,
    v: 8 + r() * 15,
    s: 8 + r() * 12,
    rot: r() * 360,
    col: [C.mint, C.emerald, '#FFFFFF', C.primary, '#D9C45A'][Math.floor(r() * 5)],
    spin: (r() - 0.5) * 14,
  }));
})();

const RING_R = 150;
const RING_C = 2 * Math.PI * RING_R;

/** Local frame 0 = global frame 540 (18.0 s). */
export const Scene6Marking: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 14, ease.out);
  const out = prog(f, 108, 12, ease.in);

  const modal = 1 - prog(f, 20, 6, ease.in);
  const calc = prog(f, 22, 6, ease.out) * (1 - prog(f, 44, 6, ease.in));
  const result = prog(f, 46, 10, ease.out);

  const count = prog(f, 54, 48, ease.out);
  const score = Math.round(SCORE * count);
  const done = prog(f, 102, 8, ease.back);
  const tr = prog(f, 100, 20, ease.back);
  const lift = 1 + 0.025 * Math.sin(Math.min(1, prog(f, 100, 14, ease.out)) * Math.PI);
  const sweepT = prog(f, 100, 22, ease.inOut);
  const press = prog(f, 18, 3) * (1 - prog(f, 21, 5));
  const spin = (f * 14) % 360;
  const bt = f - 102; // burst time

  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${-out * 80}px)`}}>
      <div style={{position: 'absolute', left: 110, top: 318}}>
        <Problem text="Marking takes days" at={2} fixAt={30} />
      </div>
      <div style={{position: 'absolute', left: 110, top: 402}}>
        <KText size={84} start={4} stagger={5} lines={[[{t: 'Instant'}, {t: 'marking.'}], [{t: 'Scores', color: C.mint}, {t: 'out', color: C.mint}, {t: 'of', color: C.mint}, {t: '100.', color: C.mint}]]} />
      </div>

      <div style={{position: 'absolute', left: 110, top: 630}}>
        <Explainer text="Every answer is marked the moment a candidate submits." at={34} width={700} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: CX - CW / 2,
          top: CY - CH / 2,
          width: CW,
          height: CH,
          borderRadius: 34,
          background: '#fff',
          overflow: 'hidden',
          fontFamily: FONT,
          boxShadow: '0 50px 110px rgba(0,0,0,0.55)',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 90}px) scale(${lift})`,
        }}
      >
        {/* 1. confirmation */}
        <div style={{position: 'absolute', inset: 0, opacity: modal, transform: `translateY(${(1 - modal) * -30}px)`, padding: '70px 60px'}}>
          <div style={{width: 84, height: 84, borderRadius: 24, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Check size={46} color={C.primary} stroke={3} />
          </div>
          <div style={{marginTop: 40, fontSize: 56, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em'}}>Submit Examination?</div>
          <div style={{marginTop: 18, fontSize: 28, fontWeight: 500, color: C.slate, lineHeight: 1.4}}>
            You answered <b style={{color: C.ink}}>50</b> questions.
            <br />
            Once submitted, this cannot be undone.
          </div>
          <div style={{position: 'absolute', left: 60, right: 60, top: 560, display: 'flex', gap: 20}}>
            <div style={{flex: 1, height: 74, borderRadius: 18, border: `2px solid ${C.line}`, color: C.slate, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Cancel</div>
            <div style={{flex: 1, height: 74, borderRadius: 18, background: C.primary, color: '#fff', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.05})`, boxShadow: '0 12px 26px rgba(22,163,74,0.4)'}}>Yes, Submit</div>
          </div>
        </div>

        {/* 2. calculating */}
        <div style={{position: 'absolute', inset: 0, opacity: calc, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <svg width={150} height={150} viewBox="0 0 150 150" style={{transform: `rotate(${spin}deg)`}}>
            <circle cx={75} cy={75} r={60} fill="none" stroke={C.line} strokeWidth={14} />
            <circle cx={75} cy={75} r={60} fill="none" stroke={C.primary} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 60 * 0.3} ${2 * Math.PI * 60}`} />
          </svg>
          <div style={{fontSize: 44, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em'}}>Calculating score…</div>
          <div style={{fontSize: 24, fontWeight: 600, color: C.slate}}>Your answers have been recorded</div>
        </div>

        {/* 3. result */}
        <div style={{position: 'absolute', inset: 0, opacity: result, transform: `translateY(${(1 - result) * 40}px)`, padding: '44px 54px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Chip bg="#ECFDF5" fg="#15803D" size={20}>
              <Check size={20} stroke={3.4} /> Exam completed
            </Chip>
            <div style={{background: C.dark, borderRadius: 14, padding: 4, display: 'flex'}}>
              <Logo36 size={40} />
            </div>
          </div>
          <div style={{marginTop: 26, fontSize: 46, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em'}}>Daniel Ade</div>
          <div style={{marginTop: 4, fontSize: 21, fontWeight: 600, color: C.slate}}>Mathematics · Mock Examination · Greenfield Academy</div>

          <div style={{position: 'absolute', left: 0, right: 0, top: 190, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={360} height={360} viewBox="0 0 360 360" style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
              <circle cx={180} cy={180} r={RING_R} fill="none" stroke="#E2E8F0" strokeWidth={26} />
              <circle cx={180} cy={180} r={RING_R} fill="none" stroke={C.primary} strokeWidth={26} strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - (SCORE / 100) * count)} />
            </svg>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: 16, fontWeight: 800, color: C.slate, letterSpacing: '0.16em'}}>OFFICIAL SCORE</div>
              <div style={{fontSize: 150, fontWeight: 900, color: C.dark, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{score}</div>
              <div style={{fontSize: 34, fontWeight: 800, color: C.slate}}>/ 100</div>
            </div>
          </div>

          <div style={{position: 'absolute', left: 54, right: 54, top: 596, display: 'flex', gap: 16}}>
            {[
              ['Correct', Math.round(CORRECT * count), '#ECFDF5', '#15803D'],
              ['Wrong', Math.round(WRONG * count), '#FEF2F2', '#B91C1C'],
              ['Unanswered', 0, '#F1F5F9', C.slate],
            ].map(([k, v, bg, fg], i) => (
              <div key={k as string} style={{flex: 1, borderRadius: 18, background: bg as string, padding: '14px 20px', opacity: prog(f, 60 + i * 4, 10), transform: `translateY(${(1 - prog(f, 60 + i * 4, 12)) * 16}px)`}}>
                <div style={{fontSize: 40, fontWeight: 900, color: fg as string, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
                <div style={{fontSize: 17, fontWeight: 700, color: C.slate}}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 54, top: 722, transform: `scale(${done})`, transformOrigin: 'left center'}}>
            <Chip bg={C.dark} fg="#fff" size={20}>
              <Check size={20} stroke={3.4} /> Marked automatically
            </Chip>
          </div>
        </div>

        {/* light sweep */}
        {sweepT > 0 && sweepT < 1 && (
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(167,243,208,0) ${sweepT * 160 - 50}%, rgba(167,243,208,0.55) ${sweepT * 160 - 36}%, rgba(167,243,208,0) ${sweepT * 160 - 22}%)`}} />
        )}
      </div>

      {/* trophy + confetti */}
      <div style={{position: 'absolute', left: CX + CW / 2 - 190, top: CY - CH / 2 - 62, width: 290, opacity: Math.min(1, tr * 2), transform: `scale(${0.3 + 0.7 * tr}) rotate(${(1 - tr) * -14}deg)`, transformOrigin: 'bottom center'}}>
        <Img src={staticFile('brand/trophy.png')} style={{width: 290, display: 'block', filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.4))'}} />
      </div>
      {bt > 0 &&
        confetti.map((p, i) => {
          const t = bt;
          const x = CX + CW / 2 - 45 + Math.cos(p.a) * p.v * t * 0.9;
          const y = CY - CH / 2 + 60 + Math.sin(p.a) * p.v * t * 0.9 + 0.5 * 0.9 * t * t;
          const op = 1 - prog(f, 102 + 18, 22);
          if (op <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, width: p.s, height: p.s * 0.55, background: p.col, opacity: op, transform: `rotate(${p.rot + p.spin * t}deg)`, borderRadius: 2}} />
          );
        })}

      <div style={{opacity: 1 - prog(f, 24, 6)}}>
        <Cursor keys={[{f: 4, x: 1620, y: 880}, {f: 16, x: 1570, y: 748}]} clicks={[18]} opacityIn={2} />
      </div>
    </AbsoluteFill>
  );
};
