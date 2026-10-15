import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {KText} from '../components/KText';
import {Chip, Dot, Logo36} from '../components/ui';
import {Battery, Book, Check, Grid, Radio, Server, Settings, User, Users, Wifi, Award, Monitor} from '../components/Icons';
import {C, FONT} from '../theme';
import {clamp, ease, lerp, pad2, prog} from '../util';
import {Problem, Strength, Explainer} from '../components/Caption';

const WX = 140;
const WY = 246;
const WW = 1640;
const WH = 780;

type Row = {name: string; dev: string; batt: number; start: number; end: number; submitAt: number | null; blip?: [number, number]};
const ROWS: Row[] = [
  {name: 'Daniel Ade', dev: 'Laptop', batt: 87, start: 0.5, end: 1, submitAt: 66},
  {name: 'Amaka Obi', dev: 'Phone', batt: 64, start: 0.12, end: 0.58, submitAt: null},
  {name: 'Tunde Bello', dev: 'Tablet', batt: 91, start: 0.4, end: 1, submitAt: 92},
  {name: 'Zainab Musa', dev: 'Laptop', batt: 73, start: 0.2, end: 0.66, submitAt: null},
  {name: 'Chidi Okeke', dev: 'Phone', batt: 52, start: 0.1, end: 0.5, submitAt: null, blip: [30, 52]},
  {name: 'Ngozi Eze', dev: 'Laptop', batt: 80, start: 0.55, end: 1, submitAt: 108},
  {name: 'Samuel Ojo', dev: 'Desktop', batt: 100, start: 0.3, end: 0.74, submitAt: null},
  {name: 'Fatima Sani', dev: 'Tablet', batt: 68, start: 0.18, end: 0.62, submitAt: null},
];
const TOTAL_Q = 50;

const SIDE: [React.ReactNode, string, boolean][] = [
  [<Grid key="a" size={22} />, 'Dashboard', false],
  [<Book key="b" size={22} />, 'Exams', false],
  [<Server key="c" size={22} />, 'Questions', false],
  [<Users key="d" size={22} />, 'Students', false],
  [<Monitor key="e" size={22} />, 'Devices', false],
  [<Radio key="f" size={22} />, 'Sessions', true],
  [<Award key="g" size={22} />, 'Results', false],
  [<Settings key="h" size={22} />, 'Settings', false],
];

/** Local frame 0 = global frame 420 (14.0 s). */
export const Scene5Monitor: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 16, ease.out);
  const out = prog(f, 108, 12, ease.in);
  const push = 1 + prog(f, 0, 126, ease.soft) * 0.045;

  const submitted = ROWS.filter((r) => r.submitAt !== null && f >= r.submitAt).length + 0;
  const count = (to: number, at: number) => Math.round(to * prog(f, at, 20, ease.out));
  const connected = count(24, 10);
  const inProgress = Math.max(0, connected - submitted - (submitted > 0 ? 0 : 0));
  const secs = 41 * 60 + 12 - Math.floor(f / 5);
  const timeLeft = `00:${pad2(secs / 60)}:${pad2(secs % 60)}`;

  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${out * 100}px)`}}>
      <div style={{position: 'absolute', left: 140, top: 22}}>
        <Problem text="Hard to supervise" at={2} fixAt={28} size={26} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 74}}>
        <KText size={76} start={2} stagger={4} lines={[[{t: 'Watch'}, {t: 'every', color: C.mint}, {t: 'candidate', color: C.mint}, {t: 'live'}]]} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 168}}>
        <Explainer text="See every candidate's progress, connection and battery while they write." at={34} width={1500} size={30} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: WX,
          top: WY,
          width: WW,
          height: WH,
          borderRadius: 24,
          overflow: 'hidden',
          background: '#F1F5F9',
          fontFamily: FONT,
          boxShadow: '0 50px 110px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 80}px) scale(${push})`,
          transformOrigin: 'top center',
        }}
      >
        {/* sidebar */}
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 250, background: '#fff', borderRight: `1px solid ${C.line}`, padding: '26px 18px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30, paddingLeft: 6}}>
            <Logo36 size={44} />
            <div>
              <div style={{fontWeight: 900, fontSize: 19, color: C.ink}}>Exam Box</div>
              <div style={{fontWeight: 700, fontSize: 12, color: C.slate}}>Admin Console</div>
            </div>
          </div>
          {SIDE.map(([ic, label, on], i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                height: 50,
                borderRadius: 12,
                padding: '0 14px',
                marginBottom: 4,
                background: on ? '#F0FDF4' : 'transparent',
                color: on ? '#15803D' : C.slate,
                fontWeight: on ? 800 : 600,
                fontSize: 18,
                opacity: prog(f, 4 + i * 2, 8),
              }}
            >
              {ic}
              {label}
            </div>
          ))}
          <div style={{position: 'absolute', left: 18, right: 18, bottom: 24, borderRadius: 16, background: '#F8FAFC', border: `1px solid ${C.line}`, padding: '14px 16px'}}>
            <div style={{fontSize: 11, fontWeight: 800, color: C.slate, letterSpacing: '0.1em'}}>SERVER STATUS</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontWeight: 800, color: '#15803D', fontSize: 16}}>
              <Dot color={C.emerald} size={10} pulse={(f % 30) / 30} /> Running
            </div>
            <div style={{fontSize: 13, color: C.slate, fontWeight: 600, marginTop: 3}}>192.168.1.20:5000</div>
          </div>
        </div>

        {/* main */}
        <div style={{position: 'absolute', left: 250, right: 0, top: 0, bottom: 0, padding: '28px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{fontSize: 34, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em'}}>Live Monitor</div>
            <Chip bg="#ECFDF5" fg="#15803D" size={16}>
              <Dot color={C.emerald} size={9} pulse={(f % 24) / 24} /> Session live
            </Chip>
            <div style={{flex: 1}} />
            <div style={{fontSize: 15, fontWeight: 700, color: C.slate}}>Mock Examination · Greenfield Academy</div>
          </div>
          <div style={{display: 'flex', gap: 18, marginTop: 22}}>
            {[
              ['Connected', connected, C.ink, <Wifi key="w" size={22} />],
              ['In progress', inProgress, '#15803D', <User key="u" size={22} />],
              ['Submitted', submitted, C.dark, <Check key="c" size={22} stroke={3} />],
              ['Time left', timeLeft, C.ink, null],
            ].map(([k, v, col, ic], i) => (
              <div key={k as string} style={{flex: 1, borderRadius: 18, background: '#fff', border: `1px solid ${C.line}`, padding: '16px 20px', opacity: prog(f, 6 + i * 3, 10), transform: `translateY(${(1 - prog(f, 6 + i * 3, 12)) * 20}px)`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', color: C.slate, fontWeight: 700, fontSize: 15}}>
                  {k as string}
                  <span style={{color: C.primary, display: 'flex'}}>{ic as React.ReactNode}</span>
                </div>
                <div style={{fontSize: 38, fontWeight: 900, color: col as string, fontVariantNumeric: 'tabular-nums', marginTop: 4}}>{v as React.ReactNode}</div>
              </div>
            ))}
          </div>

          {/* candidate table */}
          <div style={{marginTop: 22, borderRadius: 18, background: '#fff', border: `1px solid ${C.line}`, overflow: 'hidden'}}>
            <div style={{display: 'grid', gridTemplateColumns: '330px 190px 150px 1fr 170px', height: 46, alignItems: 'center', background: '#F8FAFC', color: C.slate, fontWeight: 800, fontSize: 14, letterSpacing: '0.08em', padding: '0 22px', borderBottom: `1px solid ${C.line}`}}>
              <span>CANDIDATE</span>
              <span>DEVICE</span>
              <span>ANSWERED</span>
              <span>PROGRESS</span>
              <span>STATUS</span>
            </div>
            {ROWS.map((r, i) => {
              const appear = prog(f, 10 + i * 4, 12, ease.out);
              const sub = r.submitAt !== null && f >= r.submitAt;
              const run = r.submitAt === null ? f / 126 : Math.min(1, f / r.submitAt);
              const base = r.submitAt === null ? lerp(r.start, r.end, run) : lerp(r.start, 0.97, run);
              const prSmooth = sub ? lerp(0.97, 1, prog(f, r.submitAt!, 8, ease.out)) : base;
              const ans = Math.round(prSmooth * TOTAL_Q);
              const blip = r.blip && f >= r.blip[0] && f < r.blip[1];
              const flash = r.submitAt !== null ? prog(f, r.submitAt, 4) * (1 - prog(f, r.submitAt + 4, 16)) : 0;
              return (
                <div
                  key={r.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '330px 190px 150px 1fr 170px',
                    height: 56,
                    alignItems: 'center',
                    padding: '0 22px',
                    borderBottom: i < ROWS.length - 1 ? `1px solid ${C.line}` : 'none',
                    background: `rgba(16,185,129,${flash * 0.16})`,
                    opacity: appear,
                    transform: `translateX(${(1 - appear) * 40}px)`,
                    fontSize: 19,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
                    <span style={{width: 36, height: 36, borderRadius: '50%', background: '#D1FAE5', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800}}>
                      {r.name.split(' ').map((w) => w[0]).join('')}
                    </span>
                    {r.name}
                  </span>
                  <span style={{display: 'flex', alignItems: 'center', gap: 10, color: C.slate, fontSize: 16, fontWeight: 600}}>
                    {r.dev}
                    <Battery size={20} stroke={2} color={r.batt < 60 ? C.amber : C.slate} />
                    {r.batt}%
                  </span>
                  <span style={{fontVariantNumeric: 'tabular-nums', fontWeight: 800}}>
                    {ans}
                    <span style={{color: C.slate, fontWeight: 600}}> / {TOTAL_Q}</span>
                  </span>
                  <span style={{paddingRight: 36}}>
                    <div style={{height: 12, borderRadius: 6, background: '#E2E8F0', overflow: 'hidden'}}>
                      <div style={{width: `${prSmooth * 100}%`, height: '100%', borderRadius: 6, background: sub ? C.dark : `linear-gradient(90deg, ${C.primary}, ${C.emerald})`}} />
                    </div>
                  </span>
                  <span>
                    {sub ? (
                      <Chip bg={C.dark} fg="#fff" size={15}>
                        <Check size={15} stroke={3.4} /> Submitted
                      </Chip>
                    ) : blip ? (
                      <Chip bg="#FFFBEB" fg="#B45309" size={15}>
                        <Dot color={C.amber} size={9} /> Reconnecting
                      </Chip>
                    ) : (
                      <Chip bg="#ECFDF5" fg="#15803D" size={15}>
                        <Dot color={C.emerald} size={9} pulse={((f + i * 5) % 30) / 30} /> In progress
                      </Chip>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
