import React from 'react';
import {useCurrentFrame} from '../frame';
import {C, FONT} from '../theme';
import {Crest, Logo36} from './ui';
import {Lock, User, Wifi, Clock, Check} from './Icons';
import {ease, prog} from '../util';

export const LOGIN_W = 880;
export const LOGIN_H = 600;
const ID = 'GA-2026-014';

/** Stylised student login screen (browser window). Frames are local to the parent sequence. */
export const LoginWindow: React.FC<{typeFrom: number; passFrom: number; pressAt: number}> = ({typeFrom, passFrom, pressAt}) => {
  const f = useCurrentFrame();
  const chars = Math.max(0, Math.min(ID.length, Math.floor((f - typeFrom) / 1.8)));
  const dots = Math.max(0, Math.min(8, Math.floor((f - passFrom) / 1.4)));
  const press = prog(f, pressAt, 4, ease.out) * (1 - prog(f, pressAt + 4, 6, ease.out));
  const joining = f >= pressAt + 2;
  const caret = Math.floor(f / 8) % 2 === 0;
  const field = (top: number, label: string, icon: React.ReactNode, value: React.ReactNode, focus: boolean) => (
    <div style={{position: 'absolute', left: 50, right: 50, top}}>
      <div style={{fontSize: 15, fontWeight: 700, color: C.slate, marginBottom: 8, letterSpacing: '0.02em'}}>{label}</div>
      <div
        style={{
          height: 52,
          borderRadius: 12,
          border: `2px solid ${focus ? C.primary : C.line}`,
          boxShadow: focus ? '0 0 0 5px rgba(22,163,74,0.14)' : 'none',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          color: C.ink,
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        <span style={{color: C.slate, display: 'flex'}}>{icon}</span>
        {value}
      </div>
    </div>
  );
  return (
    <div
      style={{
        width: LOGIN_W,
        height: LOGIN_H,
        borderRadius: 20,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 40px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        fontFamily: FONT,
        position: 'relative',
      }}
    >
      <div style={{height: 52, background: '#0F172A', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10}}>
        {['#EF4444', '#F59E0B', '#22C55E'].map((c) => (
          <span key={c} style={{width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.85}} />
        ))}
        <div style={{marginLeft: 18, flex: 1, height: 30, borderRadius: 15, background: '#1E293B', color: '#94A3B8', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px'}}>
          <Lock size={14} stroke={2.4} />
          192.168.1.20:5000
        </div>
      </div>
      <div style={{position: 'absolute', top: 52, left: 0, bottom: 0, width: 370, background: 'linear-gradient(160deg,#052217 0%,#062E1A 55%,#041A0E 100%)', padding: '44px 40px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Logo36 size={42} />
          <div>
            <div style={{color: '#fff', fontWeight: 800, fontSize: 18}}>Exam Box</div>
            <div style={{color: '#6EE7B7', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em'}}>STUDENT PORTAL</div>
          </div>
        </div>
        <div style={{marginTop: 70, color: 'rgba(255,255,255,0.88)', fontSize: 34, fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em'}}>
          Secure. Reliable.
          <div style={{color: C.emerald, fontWeight: 800}}>Built for excellence.</div>
        </div>
        <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14}}>
          {[
            [<Lock key="a" size={16} color={C.emerald} />, 'Secure testing'],
            [<Wifi key="b" size={16} color={C.emerald} />, 'Instant sync'],
            [<Clock key="c" size={16} color={C.emerald} />, 'Timed sessions'],
          ].map(([ic, t], i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, color: '#CBD5E1', fontSize: 15, fontWeight: 600}}>
              <span style={{width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {ic}
              </span>
              {t as string}
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', top: 52, left: 370, right: 0, bottom: 0}}>
        <div style={{position: 'absolute', left: 50, top: 40, display: 'flex', alignItems: 'center', gap: 14}}>
          <Crest size={46} dark />
          <div>
            <div style={{fontSize: 20, fontWeight: 800, color: C.ink}}>Greenfield Academy</div>
            <div style={{fontSize: 14, fontWeight: 600, color: C.slate}}>Student Exam Portal</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 50, top: 122, fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em'}}>Welcome back</div>
        {field(196, 'Student ID', <User size={20} />, <span>{ID.slice(0, chars)}{caret && f >= typeFrom && f < passFrom ? <span style={{color: C.primary}}>|</span> : ''}</span>, f >= typeFrom - 4 && f < passFrom - 2)}
        {field(294, 'Password', <Lock size={20} />, <span style={{letterSpacing: '0.2em'}}>{'•'.repeat(dots)}</span>, f >= passFrom - 3 && f < pressAt - 4)}
        <div
          style={{
            position: 'absolute',
            left: 50,
            right: 50,
            top: 394,
            height: 58,
            borderRadius: 14,
            background: joining ? C.dark : C.primary,
            color: '#fff',
            fontWeight: 800,
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transform: `scale(${1 - press * 0.04})`,
            boxShadow: '0 10px 22px rgba(22,163,74,0.35)',
          }}
        >
          {joining ? (
            <>
              <Check size={22} /> Joined session
            </>
          ) : (
            'Sign In'
          )}
        </div>
        <div style={{position: 'absolute', left: 50, bottom: 22, fontSize: 12, color: C.slate, fontWeight: 600}}>
          Exam Box is a school examination system. Not affiliated with or endorsed by JAMB or WAEC.
        </div>
      </div>
    </div>
  );
};
