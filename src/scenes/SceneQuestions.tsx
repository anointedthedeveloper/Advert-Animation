import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {KText} from '../components/KText';
import {Chip, Crest, Logo36} from '../components/ui';
import {Check} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, prog} from '../util';

const WX = 930;
const WY = 150;
const WW = 880;
const WH = 780;
const YEARS = 28; // 1998 ... 2025

const Diagram: React.FC<{draw: number}> = ({draw}) => {
  const len = 320;
  const off = len * (1 - draw);
  return (
    <svg width={210} height={128} viewBox="0 0 210 128">
      <rect width="210" height="128" rx="12" fill="#F8FAFC" />
      <path d="M26 100 L182 100 L182 26 Z" fill="none" stroke={C.dark} strokeWidth={3.4} strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={off} />
      <path d="M170 100 L170 88 L182 88" fill="none" stroke={C.slate} strokeWidth={2} opacity={draw} />
      <path d="M62 100 A36 36 0 0 0 58 84" fill="none" stroke={C.primary} strokeWidth={3} opacity={draw} />
      <text x="70" y="90" fontFamily={FONT} fontSize="15" fontWeight="800" fill={C.primary} opacity={draw}>
        40°
      </text>
      <text x="92" y="119" fontFamily={FONT} fontSize="15" fontWeight="800" fill={C.ink} opacity={draw}>
        12 cm
      </text>
      <text x="188" y="68" fontFamily={FONT} fontSize="17" fontWeight="900" fill={C.ink} opacity={draw}>
        x
      </text>
    </svg>
  );
};

const Pill: React.FC<{children: React.ReactNode; at: number; filled?: boolean}> = ({children, at, filled}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 12, ease.back);
  return (
    <div style={{opacity: Math.min(1, p * 2), transform: `scale(${0.8 + 0.2 * p}) translateY(${(1 - p) * 14}px)`, transformOrigin: 'left center'}}>
      <Chip
        bg={filled ? C.primary : 'rgba(167,243,208,0.1)'}
        fg={filled ? '#fff' : C.mint}
        size={27}
        style={{border: filled ? 'none' : '1px solid rgba(167,243,208,0.4)'}}
      >
        {children}
      </Chip>
    </div>
  );
};

type CardDef = {
  at: number;
  tag: string;
  tagBg: string;
  tagFg: string;
  meta: string;
  text: string;
  image?: boolean;
  spot: [number, number];
  custom?: boolean;
};
const CARDS: CardDef[] = [
  {at: 12, tag: 'JAMB', tagBg: '#ECFDF5', tagFg: '#15803D', meta: '2014 · Mathematics · Question 12', text: 'In the diagram, find the value of x.', image: true, spot: [14, 38]},
  {at: 24, tag: 'WAEC', tagBg: '#EFF6FF', tagFg: '#1D4ED8', meta: '2009 · Physics · Question 7', text: 'A body of mass 2 kg accelerates at 3 m/s². Calculate the force.', spot: [38, 62]},
  {at: 36, tag: 'Greenfield Academy', tagBg: C.dark, tagFg: '#fff', meta: 'Custom question · Chemistry · Question 3', text: 'Which gas is produced when zinc reacts with dilute acid?', custom: true, spot: [62, 100]},
];

/** Local frame 0 = global frame 180 (6.0 s). Past questions, images, JAMB / WAEC sources, custom school questions. */
export const SceneQuestions: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 16, ease.out);
  const out = prog(f, 78, 12, ease.in);
  const ruler = prog(f, 16, 46, ease.inOut);
  const activeTab = f < 38 ? 0 : f < 62 ? 1 : 2;
  const tabs = ['JAMB', 'WAEC', 'Greenfield Academy'];
  const yearNow = Math.round(lerp(1998, 2025, ruler));

  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${-out * 80}px)`}}>
      <div style={{position: 'absolute', left: 110, top: 236}}>
        <KText size={92} start={3} stagger={4} lines={[[{t: 'Past'}, {t: 'questions'}], [{t: '1998', color: C.mint}, {t: 'to', color: C.mint}, {t: 'date.', color: C.mint}]]} />
      </div>
      <div style={{position: 'absolute', left: 110, top: 540, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{display: 'flex', gap: 14}}>
          <Pill at={22} filled>JAMB</Pill>
          <Pill at={27} filled>WAEC</Pill>
          <Pill at={32}>Images included</Pill>
        </div>
        <div style={{display: 'flex'}}>
          <Pill at={38}>Your own school questions</Pill>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 1006, fontFamily: FONT, fontSize: 19, fontWeight: 500, color: 'rgba(241,245,249,0.6)', opacity: prog(f, 30, 14)}}>
        Not affiliated with or endorsed by JAMB or WAEC.
      </div>

      <div
        style={{
          position: 'absolute',
          left: WX,
          top: WY,
          width: WW,
          height: WH,
          borderRadius: 26,
          overflow: 'hidden',
          background: '#F1F5F9',
          fontFamily: FONT,
          boxShadow: '0 50px 110px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 70}px)`,
        }}
      >
        <div style={{height: 72, background: '#fff', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px'}}>
          <Logo36 size={38} />
          <div style={{fontWeight: 900, fontSize: 26, color: C.ink, letterSpacing: '-0.01em'}}>Question Bank</div>
          <div style={{flex: 1}} />
          <Chip bg="#F1F5F9" fg={C.slate} size={16}>All subjects</Chip>
        </div>

        <div style={{display: 'flex', gap: 10, padding: '16px 26px 0'}}>
          {tabs.map((t, i) => (
            <div
              key={t}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 18,
                background: i === activeTab ? C.primary : '#fff',
                color: i === activeTab ? '#fff' : C.slate,
                border: `1.5px solid ${i === activeTab ? C.primary : C.line}`,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div style={{margin: '18px 26px 0', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 20px 16px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <span style={{fontSize: 14, fontWeight: 800, color: C.slate, letterSpacing: '0.1em'}}>YEARS</span>
            <span style={{fontSize: 18, fontWeight: 900, color: C.dark, fontVariantNumeric: 'tabular-nums'}}>
              1998 – {ruler > 0.97 ? 'Date' : yearNow}
            </span>
          </div>
          <div style={{position: 'relative', height: 30, marginTop: 8}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 13, height: 5, borderRadius: 3, background: C.line}} />
            <div style={{position: 'absolute', left: 0, top: 13, height: 5, borderRadius: 3, background: C.primary, width: `${ruler * 100}%`}} />
            {Array.from({length: YEARS}, (_, i) => {
              const x = (i / (YEARS - 1)) * 100;
              const on = i / (YEARS - 1) <= ruler;
              return <div key={i} style={{position: 'absolute', left: `${x}%`, top: i % 5 === 0 ? 2 : 8, width: 2, height: i % 5 === 0 ? 26 : 14, marginLeft: -1, background: on ? C.primary : '#CBD5E1', opacity: i % 5 === 0 ? 1 : 0.8}} />;
            })}
            <div style={{position: 'absolute', left: `${ruler * 100}%`, top: 5, width: 20, height: 20, marginLeft: -10, borderRadius: '50%', background: '#fff', border: `4px solid ${C.primary}`, boxShadow: '0 3px 8px rgba(0,0,0,0.2)'}} />
          </div>
        </div>

        <div style={{padding: '16px 26px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
          {CARDS.map((c, i) => {
            const p = prog(f, c.at, 16, ease.out);
            const spot = f >= c.spot[0] && f < c.spot[1];
            const draw = prog(f, c.at + 8, 26, ease.inOut);
            return (
              <div
                key={i}
                style={{
                  height: 150,
                  borderRadius: 18,
                  background: '#fff',
                  border: `2px solid ${spot ? C.primary : C.line}`,
                  boxShadow: spot ? '0 12px 30px rgba(22,163,74,0.18)' : 'none',
                  padding: '16px 22px',
                  display: 'flex',
                  gap: 20,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 90}px)`,
                }}
              >
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <Chip bg={c.tagBg} fg={c.tagFg} size={16}>
                      {c.custom && <Crest size={20} />}
                      {c.tag}
                    </Chip>
                    <span style={{fontSize: 16, fontWeight: 700, color: C.slate}}>{c.meta}</span>
                  </div>
                  <div style={{marginTop: 14, fontSize: 25, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.25}}>{c.text}</div>
                  {c.custom && (
                    <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#15803D', fontWeight: 800, fontSize: 16}}>
                      <Check size={18} stroke={3.2} /> Added by your school
                    </div>
                  )}
                </div>
                {c.image && <Diagram draw={draw} />}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
