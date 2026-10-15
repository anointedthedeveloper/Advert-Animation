import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {KText} from '../components/KText';
import {Cursor} from '../components/Cursor';
import {LoginWindow, LOGIN_H, LOGIN_W} from '../components/LoginWindow';
import {DeviceFrame, Chip, Logo36} from '../components/ui';
import {Check, Server, Wifi} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, prog} from '../util';
import {Problem, Strength, Explainer} from '../components/Caption';

const WIN = {cx: 1330, cy: 540};
const SERVER = {x: 1340, y: 560};
const LAPTOP = {x: 1085, y: 330, s: 0.36};
const DEVICES = [
  {kind: 'tablet' as const, x: 1590, y: 340, w: 300, h: 214, at: 80, label: 'Tablet'},
  {kind: 'phone' as const, x: 1640, y: 760, w: 140, h: 270, at: 88, label: 'Phone'},
  {kind: 'desktop' as const, x: 1040, y: 770, w: 300, h: 204, at: 96, label: 'Desktop'},
];

const MiniScreen: React.FC<{at: number; compact?: boolean}> = ({at, compact}) => {
  const f = useCurrentFrame();
  const p = prog(f, at + 8, 10, ease.back);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#052217,#041A0E)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '16%', background: 'linear-gradient(90deg,#052217,#0A5D38)'}} />
      <div style={{position: 'absolute', left: '10%', right: '10%', top: '26%', bottom: '14%', borderRadius: 10, background: '#fff'}}>
        <div style={{margin: '10% 10% 0', height: 8, borderRadius: 4, background: C.line, width: '60%'}} />
        <div style={{margin: '6% 10% 0', height: 8, borderRadius: 4, background: C.line, width: '40%'}} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: compact ? '14%' : '16%',
            width: compact ? 34 : 44,
            height: compact ? 34 : 44,
            marginLeft: compact ? -17 : -22,
            borderRadius: '50%',
            background: C.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${p})`,
          }}
        >
          <Check size={compact ? 20 : 26} color="#fff" stroke={3} />
        </div>
      </div>
    </div>
  );
};

/** Local frame 0 = global frame 180 (6.0 s). */
export const Scene3Network: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 16, ease.out);
  const out = prog(f, 108, 12, ease.in);
  const shrink = prog(f, 66, 26, ease.inOut);
  const s = lerp(1, LAPTOP.s, shrink);
  const x = lerp(WIN.cx, LAPTOP.x, shrink);
  const y = lerp(WIN.cy, LAPTOP.y, shrink);
  const bezel = prog(f, 78, 14, ease.out);
  const linesP = (at: number) => prog(f, at, 18, ease.inOut);
  const nodes = [{x: LAPTOP.x, y: LAPTOP.y + 10, at: 76}, ...DEVICES.map((d) => ({x: d.x, y: d.y, at: d.at}))];
  const ringT = ((f - 74) % 40) / 40;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${-out * 90}px)`}}>
      <div style={{position: 'absolute', left: 120, top: 226}}>
        <Problem text="Cyber café fees" at={2} fixAt={30} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 316}}>
        <KText size={92} start={4} stagger={4} lines={[[{t: 'Run'}, {t: 'exams'}, {t: 'on'}], [{t: 'your'}, {t: 'own', color: C.mint}], [{t: 'network', color: C.mint}]]} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 622}}>
        <Explainer text="One school PC runs the exam. Candidates join from any browser on the same network." at={34} width={760} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 780, opacity: prog(f, 46, 14), transform: `translateY(${(1 - prog(f, 46, 14)) * 18}px)`}}>
        <Chip bg="rgba(167,243,208,0.1)" fg={C.mint} size={26} style={{border: '1px solid rgba(167,243,208,0.35)'}}>
          <Wifi size={26} stroke={2.4} /> Works offline after licence activation
        </Chip>
      </div>

      {/* connection lines + pulses */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: prog(f, 76, 10)}}>
        {nodes.map((n, i) => {
          const len = Math.hypot(n.x - SERVER.x, n.y - SERVER.y);
          const lp = linesP(n.at);
          const pulse = ((f - n.at - 16 + i * 9) % 36) / 36;
          return (
            <g key={i}>
              <line x1={SERVER.x} y1={SERVER.y} x2={n.x} y2={n.y} stroke="rgba(167,243,208,0.28)" strokeWidth={3} strokeDasharray={`${len * lp} ${len}`} strokeLinecap="round" />
              {lp >= 1 && f > n.at + 16 && (
                <circle cx={lerp(n.x, SERVER.x, pulse)} cy={lerp(n.y, SERVER.y, pulse)} r={6} fill={C.mint} opacity={Math.sin(pulse * Math.PI)} />
              )}
            </g>
          );
        })}
      </svg>

      {/* server node */}
      <div style={{position: 'absolute', left: SERVER.x - 90, top: SERVER.y - 90, width: 180, height: 180, opacity: prog(f, 70, 14), transform: `scale(${0.7 + 0.3 * prog(f, 70, 18, ease.back)})`}}>
        {[0, 1].map((k) => {
          const t = (ringT + k * 0.5) % 1;
          return (
            <div key={k} style={{position: 'absolute', inset: -t * 90, borderRadius: '50%', border: '2px solid rgba(167,243,208,0.5)', opacity: (1 - t) * 0.7}} />
          );
        })}
        <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: C.primary, boxShadow: '0 22px 50px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Server size={84} color="#fff" stroke={1.8} />
        </div>
        <div style={{position: 'absolute', top: 196, left: -60, right: -60, textAlign: 'center', fontFamily: FONT, color: '#fff', fontWeight: 800, fontSize: 24}}>
          Exam Box server
          <div style={{fontSize: 17, color: C.mint, fontWeight: 600, marginTop: 4}}>Greenfield Academy · local network</div>
        </div>
      </div>

      {/* other devices */}
      {DEVICES.map((d, i) => {
        const p = prog(f, d.at - 6, 16, ease.out);
        const ok = prog(f, d.at + 12, 10, ease.back);
        return (
          <div key={i} style={{position: 'absolute', left: d.x - d.w / 2, top: d.y - d.h / 2, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + p * 0.1})`}}>
            <DeviceFrame kind={d.kind} w={d.w} h={d.h}>
              <MiniScreen at={d.at} compact={d.kind === 'phone'} />
            </DeviceFrame>
            <div style={{position: 'absolute', left: '50%', top: -34, transform: `translateX(-50%) scale(${ok})`, transformOrigin: 'bottom center'}}>
              <Chip bg={C.primary} fg="#fff" size={17}>
                <Check size={16} stroke={3.2} /> Connected
              </Chip>
            </div>
          </div>
        );
      })}

      {/* login window → laptop */}
      <div
        style={{
          position: 'absolute',
          left: x - LOGIN_W / 2,
          top: y - LOGIN_H / 2,
          width: LOGIN_W,
          height: LOGIN_H,
          opacity: inP,
          transform: `translateY(${(1 - inP) * 80}px) scale(${s})`,
          transformOrigin: 'center',
        }}
      >
        <div style={{position: 'absolute', inset: -40, borderRadius: 52, background: '#0B1220', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', opacity: bezel}} />
        <div style={{position: 'absolute', left: -90, right: -90, bottom: -80, height: 40, borderRadius: '4px 4px 40px 40px', background: 'linear-gradient(#CBD5E1,#94A3B8)', opacity: bezel}} />
        <LoginWindow typeFrom={16} passFrom={38} pressAt={58} />
      </div>
      {f > 82 && (
        <div style={{position: 'absolute', left: LAPTOP.x - 80, top: LAPTOP.y - 150, transform: `scale(${prog(f, 84, 10, ease.back)})`}}>
          <Chip bg={C.primary} fg="#fff" size={17}>
            <Check size={16} stroke={3.2} /> Connected
          </Chip>
        </div>
      )}
      <div style={{opacity: 1 - prog(f, 60, 6)}}>
      <Cursor keys={[{f: 8, x: 1430, y: 900}, {f: 18, x: 1560, y: 548}, {f: 36, x: 1560, y: 646}, {f: 54, x: 1520, y: 738}]} clicks={[18, 36, 58]} opacityIn={6} />
      </div>
    </AbsoluteFill>
  );
};
