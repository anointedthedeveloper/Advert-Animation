import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from '../frame';
import {Fit, useIsPortrait} from '../layout';
import {KText} from '../components/KText';
import {Chip, Crest, Logo36, Dot} from '../components/ui';
import {Check} from '../components/Icons';
import {C, FONT} from '../theme';
import {ease, lerp, prog} from '../util';
import {Strength} from '../components/Caption';

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


const EXAMS = [
  {at: 114, tag: 'Promotion exam', bg: '#ECFDF5', fg: '#15803D', title: 'SS 2 Promotion Exam', meta: '40 questions · 60 min · Password protected', fresh: true},
  {at: 121, tag: 'Entrance exam', bg: '#EFF6FF', fg: '#1D4ED8', title: 'JSS 1 Entrance Test', meta: '50 questions · 45 min', fresh: false},
  {at: 128, tag: 'Office test', bg: '#0F172A', fg: '#fff', title: 'Staff Assessment', meta: '30 questions · 30 min', fresh: false},
];
const EXAM_NAME = 'SS 2 Promotion Exam';

/** Phase B of the scene: building your own exam (promotion, entrance, office tests). */
const CustomExamsPanel: React.FC<{f: number; op: number}> = ({f, op}) => {
  const chars = Math.max(0, Math.min(EXAM_NAME.length, Math.floor((f - 84) / 0.9)));
  const typing = f >= 82 && chars < EXAM_NAME.length;
  const caret = Math.floor(f / 7) % 2 === 0;
  const press = prog(f, 110, 3) * (1 - prog(f, 113, 6));
  const created = f >= 114;
  const field = (label: string, value: React.ReactNode, flex: number, at: number) => {
    const p = prog(f, at, 10, ease.out);
    return (
      <div style={{flex, opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>
        <div style={{fontSize: 13, fontWeight: 800, color: C.slate, letterSpacing: '0.1em', marginBottom: 6}}>{label}</div>
        <div style={{height: 52, borderRadius: 12, border: `2px solid ${C.line}`, background: '#F8FAFC', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 21, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{value}</div>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, fontFamily: FONT}}>
      <div style={{height: 72, background: '#fff', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px'}}>
        <Logo36 size={38} />
        <div style={{fontWeight: 900, fontSize: 26, color: C.ink, letterSpacing: '-0.01em'}}>Custom Exams</div>
        <div style={{flex: 1}} />
        <Chip bg={C.primary} fg="#fff" size={16}>+ New exam</Chip>
      </div>

      <div style={{margin: '18px 26px 0', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 18, padding: '18px 22px 20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14}}>
          <span style={{fontSize: 22, fontWeight: 900, color: C.ink}}>Create an exam</span>
          <span style={{fontSize: 15, fontWeight: 700, color: C.slate}}>Your questions, your timer, your rules</span>
        </div>
        <div style={{display: 'flex', gap: 16}}>
          {field('EXAM NAME', <span>{EXAM_NAME.slice(0, chars)}{typing && caret ? <span style={{color: C.primary}}>|</span> : ''}</span>, 2.1, 80)}
          {field('DURATION', '60 min', 1, 98)}
          {field('QUESTIONS', '40 imported', 1.15, 102)}
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 16, flexWrap: 'nowrap'}}>
          {['Shuffle questions', 'Shuffle options', 'Access password'].map((t, i) => {
            const p = prog(f, 100 + i * 3, 10, ease.back);
            return (
              <div key={t} style={{opacity: Math.min(1, p * 1.6), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: 'left center'}}>
                <Chip bg="#ECFDF5" fg="#15803D" size={17}>
                  <Check size={17} stroke={3.4} /> {t}
                </Chip>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 16, height: 54, borderRadius: 14, background: created ? C.dark : C.primary, color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${1 - press * 0.04})`, boxShadow: '0 10px 22px rgba(22,163,74,0.3)'}}>
          {created ? (
            <>
              <Check size={24} stroke={3.4} /> Exam created
            </>
          ) : (
            'Create exam'
          )}
        </div>
      </div>

      <div style={{padding: '16px 26px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
        {EXAMS.map((e) => {
          const p = prog(f, e.at, 14, ease.out);
          return (
            <div
              key={e.title}
              style={{
                height: 92,
                borderRadius: 18,
                background: '#fff',
                border: `2px solid ${e.fresh && f > e.at + 6 ? C.primary : C.line}`,
                boxShadow: e.fresh && f > e.at + 6 ? '0 12px 30px rgba(22,163,74,0.18)' : 'none',
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: p,
                transform: `translateX(${(1 - p) * 90}px)`,
              }}
            >
              <div style={{flex: 1, minWidth: 0}}>
                <Chip bg={e.bg} fg={e.fg} size={15}>{e.tag}</Chip>
                <div style={{marginTop: 8, fontSize: 25, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.1}}>{e.title}</div>
                <div style={{marginTop: 3, fontSize: 16, fontWeight: 600, color: C.slate}}>{e.meta}</div>
              </div>
              <Chip bg="#ECFDF5" fg="#15803D" size={16}>
                <Dot color={C.emerald} size={9} /> Ready
              </Chip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Phase A: past questions with images (JAMB, WAEC) and custom school questions. Phase B: building your own exams. */
export const SceneQuestions: React.FC = () => {
  const f = useCurrentFrame();
  const P = useIsPortrait();
  const inP = prog(f, 0, 16, ease.out);
  const out = prog(f, 153, 12, ease.in);
  const aOp = 1 - prog(f, 62, 12, ease.inOut); // past questions fade out
  const bOp = prog(f, 70, 10, ease.out); // your own exams fade in
  const ruler = prog(f, 16, 46, ease.inOut);
  const activeTab = f < 38 ? 0 : f < 62 ? 1 : 2;
  const tabs = ['JAMB', 'WAEC', 'Greenfield Academy'];
  const yearNow = Math.round(lerp(1998, 2025, ruler));

  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${-out * 80}px)`}}>
      <div style={{position: 'absolute', inset: 0, opacity: aOp}}>
      <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 214 : 168}}>
        <Strength text="Ready on day one" at={2} />
      </div>
      <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 300 : 250}}>
        <KText size={P ? 108 : 92} start={3} stagger={4} lines={[[{t: 'Past'}, {t: 'questions'}], [{t: '1998', color: C.mint}, {t: 'to', color: C.mint}, {t: 'date.', color: C.mint}]]} />
      </div>
      <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 600 : 540, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{display: 'flex', gap: 14}}>
          <Pill at={22} filled>JAMB</Pill>
          <Pill at={27} filled>WAEC</Pill>
          <Pill at={32}>Images included</Pill>
        </div>
        <div style={{display: 'flex'}}>
          <Pill at={38}>Your own school questions</Pill>
        </div>
      </div>
      <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 1690 : 1006, fontFamily: FONT, fontSize: P ? 24 : 19, fontWeight: 500, color: 'rgba(241,245,249,0.6)', opacity: prog(f, 30, 14)}}>
        Not affiliated with or endorsed by JAMB or WAEC.
      </div>

      </div>
      <div style={{position: 'absolute', inset: 0, opacity: bOp}}>
        <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 214 : 168}}>
          <Strength text="Build your own" at={76} />
        </div>
        <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 300 : 250}}>
          <KText size={P ? 108 : 92} start={80} stagger={4} lines={[[{t: 'Your'}, {t: 'own'}], [{t: 'exams.', color: C.mint}]]} />
        </div>
        <div style={{position: 'absolute', left: P ? 80 : 110, top: P ? 560 : 470, display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
            <Pill at={92} filled>Promotion exams</Pill>
            <Pill at={96} filled>Entrance exams</Pill>
          </div>
          <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
            <Pill at={100} filled>Office tests</Pill>
            <Pill at={104}>Your questions, your timer</Pill>
          </div>
        </div>
      </div>
      <Fit from={{x: WX, y: WY, w: WW}} to={{x: 100, y: 800, w: 880}}>
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
        <div style={{position: 'absolute', inset: 0, opacity: aOp}}>
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
        <CustomExamsPanel f={f} op={bOp} />
      </div>
      </Fit>
    </AbsoluteFill>
  );
};
