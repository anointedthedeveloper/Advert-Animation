import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {KText} from '../components/KText';
import {Cursor} from '../components/Cursor';
import {Chip, Dot, Logo36} from '../components/ui';
import {Check, Clock, Flag} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, pad2, prog} from '../util';

const PX = 140;
const PY = 232;
const PW = 1640;
const PH = 780;

const checklist = ['I have my ID/slip ready', 'My mouse is working properly', 'My keyboard is working properly', 'I understand the keyboard shortcuts'];

const WaitingRoom: React.FC = () => {
  const f = useCurrentFrame();
  const count = f < 8 ? 3 : f < 15 ? 2 : f < 22 ? 1 : 0;
  const ready = f >= 22;
  const btn = prog(f, 22, 10, ease.back);
  const press = prog(f, 31, 3) * (1 - prog(f, 34, 5));
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#052217 0%,#062E1A 50%,#041A0E 100%)', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
        <Logo36 size={52} />
        <div>
          <div style={{color: '#fff', fontWeight: 800, fontSize: 24}}>Exam Box</div>
          <div style={{color: '#6EE7B7', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em'}}>WAITING ROOM</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 64, top: 178, color: 'rgba(255,255,255,0.88)', fontSize: 54, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1}}>
        Take a deep breath.
        <div style={{fontWeight: 800, color: C.emerald}}>The exam starts soon.</div>
      </div>
      <div style={{position: 'absolute', left: 64, top: 372, width: 620, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{color: '#6EE7B7', fontWeight: 800, fontSize: 16, letterSpacing: '0.12em'}}>PRE-EXAM CHECKLIST</div>
        {checklist.map((t, i) => {
          const p = prog(f, 3 + i * 4, 8, ease.back);
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, color: '#E2E8F0', fontSize: 25, fontWeight: 600}}>
              <span style={{width: 34, height: 34, borderRadius: 10, border: `2px solid ${p > 0.5 ? C.emerald : 'rgba(255,255,255,0.25)'}`, background: p > 0.5 ? C.emerald : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{transform: `scale(${p})`, display: 'flex'}}>
                  <Check size={22} stroke={3.4} color="#fff" />
                </span>
              </span>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 64, top: 52, width: 640, height: 676, borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,243,208,0.22)', padding: 40}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{color: '#94A3B8', fontWeight: 700, fontSize: 15, letterSpacing: '0.1em'}}>EXAM SESSION</div>
            <div style={{color: '#fff', fontWeight: 800, fontSize: 32, marginTop: 6}}>Mock Examination</div>
          </div>
          <Chip bg="rgba(16,185,129,0.2)" fg="#6EE7B7" size={18}>
            <Dot color={C.emerald} size={10} pulse={(f % 24) / 24} /> Synced
          </Chip>
        </div>
        <div style={{display: 'flex', gap: 16, marginTop: 32}}>
          {[
            ['Duration', '60 min'],
            ['Questions', '50'],
            ['Subjects', '4'],
          ].map(([k, v]) => (
            <div key={k} style={{flex: 1, borderRadius: 16, background: 'rgba(0,0,0,0.25)', padding: '16px 18px'}}>
              <div style={{color: '#94A3B8', fontSize: 15, fontWeight: 600}}>{k}</div>
              <div style={{color: '#fff', fontSize: 30, fontWeight: 800, marginTop: 4}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 210, height: 210, borderRadius: '50%', position: 'relative'}}>
            <svg width={210} height={210} viewBox="0 0 210 210" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
              <circle cx={105} cy={105} r={92} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
              <circle cx={105} cy={105} r={92} fill="none" stroke={C.emerald} strokeWidth={10} strokeLinecap="round" strokeDasharray={2 * Math.PI * 92} strokeDashoffset={2 * Math.PI * 92 * (1 - prog(f, 0, 24, (t) => t))} />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{color: '#94A3B8', fontSize: 15, fontWeight: 700, letterSpacing: '0.1em'}}>STARTS IN</div>
              <div style={{color: '#fff', fontSize: 82, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{ready ? '0' : count}</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 34,
              width: 360,
              height: 70,
              borderRadius: 18,
              background: ready ? C.primary : 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.35 + 0.65 * btn,
              transform: `scale(${1 - press * 0.05})`,
              boxShadow: ready ? '0 14px 30px rgba(22,163,74,0.45)' : 'none',
            }}
          >
            Begin exam
          </div>
        </div>
      </div>
    </div>
  );
};

const NAV_ANSWERED = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11]);
const NAV_FLAGGED = new Set([9]);

const ExamUI: React.FC<{f: number}> = ({f}) => {
  // f is local to the exam UI (0 = the moment it appears)
  const secs = 3600 - Math.floor(f / 6) * 1;
  const timer = `${pad2(secs / 3600)}:${pad2((secs % 3600) / 60)}:${pad2(secs % 60)}`;
  const sel = prog(f, 38, 6, ease.back);
  const picked = f >= 36;
  const answered = NAV_ANSWERED.size + (picked ? 1 : 0);
  const calc = prog(f, 6, 16, ease.out);
  const calcSeq = [
    {at: 16, d: '22'},
    {at: 19, d: '22 −'},
    {at: 22, d: '22 − 7'},
    {at: 25, d: '15'},
    {at: 28, d: '15 ÷ 3'},
    {at: 31, d: '5'},
  ];
  let disp = '0';
  for (const s of calcSeq) if (f >= s.at) disp = s.d;
  const tiles = Array.from({length: 50}, (_, i) => i + 1);
  const options = [
    ['A', '3'],
    ['B', '5'],
    ['C', '7'],
    ['D', '15'],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, #123F2D 0%, #062C1D 45%, #02140D 100%)', fontFamily: FONT}}>
      <div style={{height: 72, background: 'linear-gradient(135deg,#052217 0%,#0A5D38 55%,#10B981 100%)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 22, color: '#fff'}}>
        <Logo36 size={40} />
        <div style={{fontWeight: 800, fontSize: 20}}>Mock Examination</div>
        <div style={{display: 'flex', gap: 8, marginLeft: 26}}>
          {['Use of English', 'Mathematics', 'Physics', 'Chemistry'].map((s, i) => (
            <div key={s} style={{padding: '9px 20px', borderRadius: 12, fontWeight: 700, fontSize: 17, background: i === 1 ? '#fff' : 'rgba(255,255,255,0.12)', color: i === 1 ? C.dark : 'rgba(255,255,255,0.9)'}}>
              {s}
            </div>
          ))}
        </div>
        <div style={{flex: 1}} />
        <Chip bg="rgba(16,185,129,0.28)" fg="#A7F3D0" size={16} style={{border: '1.5px solid rgba(16,185,129,0.5)'}}>
          <Dot color="#6EE7B7" size={8} pulse={(f % 30) / 30} /> Connected
        </Chip>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '8px 18px', minWidth: 170, justifyContent: 'center', transform: `scale(${1 + 0.04 * Math.max(0, 1 - ((f % 6) / 3))})`}}>
          <Clock size={22} />
          <span style={{fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em'}}>{timer}</span>
        </div>
      </div>

      {/* question card */}
      <div style={{position: 'absolute', left: 28, top: 98, width: 1180, height: 654, borderRadius: 26, background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '34px 40px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Chip bg="#ECFDF5" fg={C.dark} size={17}>Mathematics</Chip>
          <span style={{color: C.slate, fontWeight: 700, fontSize: 18}}>Question 12 of 50</span>
          <div style={{flex: 1}} />
          <Chip bg="#FFFBEB" fg="#B45309" size={16}><Flag size={16} /> Flag</Chip>
        </div>
        <div style={{marginTop: 30, fontSize: 42, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.18, width: 760}}>
          If 3x + 7 = 22, find the value of x.
        </div>
        <div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14, width: 760}}>
          {options.map(([l, t]) => {
            const on = l === 'B' && picked;
            return (
              <div
                key={l}
                style={{
                  height: 74,
                  borderRadius: 16,
                  border: `2px solid ${on ? C.primary : C.line}`,
                  background: on ? '#F0FDF4' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '0 22px',
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.ink,
                  transform: on ? `scale(${1 + 0.015 * sel})` : undefined,
                }}
              >
                <span style={{width: 42, height: 42, borderRadius: '50%', background: on ? C.primary : '#E2E8F0', color: on ? '#fff' : C.slate, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 800}}>{l}</span>
                {t}
                {on && (
                  <span style={{marginLeft: 'auto', transform: `scale(${sel})`, display: 'flex'}}>
                    <Check size={32} color={C.primary} stroke={3.4} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 40, right: 40, bottom: 30, display: 'flex', gap: 14}}>
          <div style={{padding: '14px 30px', borderRadius: 14, border: `2px solid ${C.line}`, fontWeight: 800, fontSize: 20, color: C.slate}}>Previous</div>
          <div style={{flex: 1}} />
          <div style={{padding: '14px 34px', borderRadius: 14, background: C.primary, color: '#fff', fontWeight: 800, fontSize: 20, transform: `scale(${1 + 0.05 * (prog(f, 56, 6) * (1 - prog(f, 62, 8)))})`}}>Next</div>
          <div style={{padding: '14px 34px', borderRadius: 14, background: C.dark, color: '#fff', fontWeight: 800, fontSize: 20}}>Submit</div>
        </div>
      </div>

      {/* navigator */}
      <div style={{position: 'absolute', left: 1236, top: 98, width: 376, height: 654, borderRadius: 26, background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '28px 26px'}}>
        <div style={{fontWeight: 800, fontSize: 22, color: C.ink}}>Question Navigator</div>
        <div style={{display: 'flex', gap: 10, marginTop: 16}}>
          {[
            ['Done', answered, '#ECFDF5', C.dark],
            ['Flagged', 1, '#FFFBEB', '#B45309'],
            ['Left', 50 - answered, '#F1F5F9', C.slate],
          ].map(([k, v, bg, fg]) => (
            <div key={k as string} style={{flex: 1, borderRadius: 12, background: bg as string, padding: '10px 12px'}}>
              <div style={{fontSize: 26, fontWeight: 900, color: fg as string, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
              <div style={{fontSize: 13, fontWeight: 700, color: C.slate}}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7, marginTop: 20}}>
          {tiles.map((n) => {
            const done = NAV_ANSWERED.has(n) || (n === 12 && picked);
            const flagged = NAV_FLAGGED.has(n);
            const cur = n === 12;
            const reveal = prog(f, 2 + n * 0.25, 8, ease.out);
            return (
              <div
                key={n}
                style={{
                  height: 38,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 17,
                  background: flagged ? C.amber : done ? C.primary : '#F1F5F9',
                  color: flagged || done ? '#fff' : C.slate,
                  border: cur ? `3px solid ${C.ink}` : '3px solid transparent',
                  opacity: reveal,
                  transform: `scale(${0.7 + 0.3 * reveal})`,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>
      </div>

      {/* calculator */}
      <div
        style={{
          position: 'absolute',
          left: 842,
          top: 238,
          width: 330,
          borderRadius: 24,
          background: '#0F172A',
          padding: 20,
          boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
          opacity: calc,
          transform: `translateY(${(1 - calc) * 60}px) scale(${0.92 + 0.08 * calc})`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontWeight: 700, fontSize: 15, marginBottom: 10}}>
          <span>Calculator</span>
          <span>✕</span>
        </div>
        <div style={{height: 86, borderRadius: 14, background: '#020617', color: '#fff', fontSize: 40, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 18px', fontVariantNumeric: 'tabular-nums'}}>{disp}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14}}>
          {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'].map((k, i) => {
            const op = '÷×−+'.includes(k);
            const eq = k === '=';
            return (
              <div key={i} style={{height: 56, borderRadius: 12, background: eq ? C.primary : op ? '#1E3A32' : '#1E293B', color: op ? C.mint : '#fff', fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {k}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Local frame 0 = global frame 300 (10.0 s). */
export const Scene4Start: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 14, ease.out);
  const out = prog(f, 108, 12, ease.in);
  const swap = prog(f, 36, 10, ease.inOut); // waiting room -> exam
  const flash = prog(f, 35, 3, ease.out) * (1 - prog(f, 38, 10, ease.out));
  const push = 1 + prog(f, 0, 126, ease.soft) * 0.035;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateY(${out * -60}px)`}}>
      <div style={{position: 'absolute', left: 140, top: 70}}>
        <KText size={80} start={2} stagger={4} lines={[[{t: 'Everyone'}, {t: 'starts', color: C.mint}, {t: 'together', color: C.mint}]]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: PX,
          top: PY,
          width: PW,
          height: PH,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 50px 110px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 70}px) scale(${push})`,
          transformOrigin: 'top center',
        }}
      >
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${-swap * 140}px)`, opacity: 1 - swap}}>
          <WaitingRoom />
        </div>
        {f >= 34 && (
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - swap) * 100}% 0 0)`}}>
            <ExamUI f={f - 36} />
          </div>
        )}
        <div style={{position: 'absolute', inset: 0, background: C.mint, opacity: flash * 0.5}} />
      </div>
      <Cursor
        keys={[
          {f: 16, x: 1500, y: 900},
          {f: 30, x: 1402, y: 842},
          {f: 52, x: 1402, y: 842},
          {f: 68, x: 330, y: 648},
        ]}
        clicks={[32, 70]}
        opacityIn={14}
      />
    </AbsoluteFill>
  );
};
