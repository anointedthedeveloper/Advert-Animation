import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import cues from './cues.json';
import {ease, prog, lerp, clamp} from '../util';
import {P, SANS, SCHOOL, SERIF} from './theme';
import {Badge, BrandStrip, Check, Chip, Flash, Grain, LyricBlock, Phrase, PhotoWindow, Sparks, Spark, Stage, Stamp, TimeProvider, Vignette, Wipe, WindowEdge, useGeo, useT} from './common';

const L = cues.lyrics as Phrase[];
const VO = Object.fromEntries(cues.vo.map((v) => [v.id, v.start])) as Record<string, number>;
const DROP = cues.drop;

// scene boundaries (seconds). Wipes are centred on these.
const B = {drop: DROP, framed: 14.2, typo: 42.3, finale: 46.6, cta: 55.3};

// beats that get a small zoom "thump" in the photo window (they line up with the thumps in the sound design)
const PULSES = [VO.v1, VO.v2, VO.v3, L[1].start, L[2].start, L[3].start, L[4].start, L[5].start, L[6].start, L[7].start, L[8].start, L[9].start, L[10].start, L[11].start];

// ------------------------------------------------------------------------------------------------ fonts
const SERIF_FILES: [string, string, string][] = [
  ['700', 'normal', 'playfair-display-latin-700-normal.woff2'],
  ['900', 'normal', 'playfair-display-latin-900-normal.woff2'],
  ['700', 'italic', 'playfair-display-latin-700-italic.woff2'],
  ['900', 'italic', 'playfair-display-latin-900-italic.woff2'],
];
const SANS_FILES: [number, string][] = [
  [600, 'Inter-SemiBold.otf'],
  [700, 'Inter-Bold.otf'],
  [800, 'Inter-ExtraBold.otf'],
  [900, 'Inter-Black.otf'],
];
const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    const add = (f: FontFace) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
    Promise.all([
      ...SERIF_FILES.map(([w, st, file]) => new FontFace('PH Serif', `url(${staticFile('ph/fonts/' + file)})`, {weight: w, style: st}).load().then(add)),
      ...SANS_FILES.map(([w, file]) => new FontFace('Inter', `url(${staticFile('fonts/' + file)})`, {weight: String(w)}).load().then(add)),
    ])
      .then(() => continueRender(handle))
      .catch((e) => {
        throw e;
      });
  }, [handle]);
};

// ------------------------------------------------------------------------------------------------ helpers
const Between: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const t = useT();
  return t >= a && t < b ? <>{children}</> : null;
};

/** Absolute box that centres its children inside the text zone. */
const Zone: React.FC<{children: React.ReactNode; justify?: 'center' | 'flex-start' | 'flex-end'}> = ({children, justify = 'center'}) => {
  const g = useGeo();
  return <div style={{position: 'absolute', left: g.zone.x, top: g.zone.y, width: g.zone.w, height: g.zone.h, display: 'flex', flexDirection: 'column', justifyContent: justify, alignItems: 'flex-start'}}>{children}</div>;
};

const Rays: React.FC<{color?: string; opacity?: number; cx?: string; cy?: string; speed?: number}> = ({color = 'rgba(246,185,59,0.5)', opacity = 0.35, cx = '50%', cy = '38%', speed = 5}) => {
  const t = useT();
  return (
    <AbsoluteFill
      style={{
        background: `repeating-conic-gradient(from ${t * speed}deg at ${cx} ${cy}, ${color} 0deg, rgba(0,0,0,0) 9deg, rgba(0,0,0,0) 18deg)`,
        opacity,
        WebkitMaskImage: `radial-gradient(circle at ${cx} ${cy}, #000 0%, rgba(0,0,0,0.0) 70%)`,
        maskImage: `radial-gradient(circle at ${cx} ${cy}, #000 0%, rgba(0,0,0,0.0) 70%)`,
      }}
    />
  );
};

// ------------------------------------------------------------------------------------------------ scene 1: the hook
const HOOK = [
  {t0: 0, vo: VO.v1, a: 'NURTURING', b: 'excellence.', src: 'kids-writing.jpg', pos: '50% 36%', kb: {z0: 1.05, z1: 1.2, x0: 1.5, x1: -1.5}},
  {t0: 2.15, vo: VO.v2, a: 'INSPIRING', b: 'innovation.', src: 'science-lab.jpg', pos: '50% 44%', kb: {z0: 1.18, z1: 1.04, x0: -1.5, x1: 1}},
  {t0: 3.85, vo: VO.v3, a: 'BUILDING GLOBAL', b: 'leaders.', src: 'students-red.jpg', pos: '50% 34%', kb: {z0: 1.04, z1: 1.22, y0: 0, y1: 2}},
];
const Hook: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const bSize = g.portrait ? 168 : 112;
  const tension = prog(t, 5.2, DROP - 5.2, ease.in);
  return (
    <AbsoluteFill>
      <Stage />
      <PhotoWindow items={HOOK.map((h) => ({src: h.src, t0: h.t0, pos: h.pos, kb: h.kb}))} pulses={[VO.v1, VO.v2, VO.v3]} tEnd={DROP + 0.1} />
      <WindowEdge />
      {HOOK.map((h, i) => {
        const end = i + 1 < HOOK.length ? HOOK[i + 1].t0 + 0.1 : DROP + 0.05;
        return (
          <Zone key={i}>
            <Stamp t0={h.vo - 0.05} t1={end - 0.2}>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: g.portrait ? 50 : 38, letterSpacing: '0.2em', color: P.cream, marginBottom: 6}}>{h.a}</div>
            </Stamp>
            <Stamp t0={h.vo + 0.12} t1={end - 0.2}>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: bSize, lineHeight: 1.02, color: P.gold, whiteSpace: 'nowrap', textShadow: '0 6px 40px rgba(0,0,0,0.55)'}}>{h.b}</div>
            </Stamp>
          </Zone>
        );
      })}
      <AbsoluteFill style={{background: '#000', opacity: tension * 0.42, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ scene 2: the name (cream card)
const Reveal: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const p = prog(t, DROP, 0.9, ease.back);
  const ring = prog(t, DROP, 1.1, ease.out);
  const badgeW = g.portrait ? 800 : 640;
  const bx = g.portrait ? g.W / 2 : 470;
  const by = g.portrait ? 640 : g.H / 2;
  const nameIn = prog(t, DROP + 0.45, 0.6, ease.out);
  const sub = prog(t, DROP + 0.75, 0.6, ease.out);
  const txtX = g.portrait ? 0 : 900;
  const txtW = g.portrait ? g.W : 920;
  const align = g.portrait ? 'center' : 'left';
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${g.portrait ? '50% 34%' : '25% 50%'}, #FFFFFF 0%, ${P.paper} 42%, #F1DFA6 100%)`}}>
      <Rays cx={g.portrait ? '50%' : '25%'} cy={g.portrait ? '34%' : '50%'} color="rgba(246,185,59,0.55)" opacity={0.28} />
      {/* expanding ring on the drop */}
      <div style={{position: 'absolute', left: bx - 420 * ring - 20, top: by - 420 * ring - 20, width: 840 * ring + 40, height: 840 * ring + 40, borderRadius: '50%', border: `${10 * (1 - ring) + 1}px solid ${P.gold}`, opacity: (1 - ring) * 0.9}} />
      <div style={{position: 'absolute', left: bx - badgeW / 2, top: by - (badgeW * 0.877) / 2, transform: `scale(${lerp(0.5, 1, p)}) rotate(${lerp(-5, 0, p)}deg)`, opacity: prog(t, DROP, 0.15, ease.out), filter: 'drop-shadow(0 30px 40px rgba(53,51,0,0.35))'}}>
        <Badge width={badgeW} />
      </div>
      <div style={{position: 'absolute', left: txtX, top: g.portrait ? 1010 : 250, width: txtW, textAlign: align, padding: g.portrait ? '0 40px' : 0, boxSizing: 'border-box', opacity: nameIn, transform: `translateY(${(1 - nameIn) * 30}px)`}}>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: g.portrait ? 116 : 108, lineHeight: 1, color: P.crimson, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>PETER HARVARD</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: g.portrait ? 38 : 36, letterSpacing: '0.34em', color: P.olive, marginTop: 16, marginRight: g.portrait ? '-0.34em' : 0}}>INTERNATIONAL SCHOOLS</div>
      </div>
      <div style={{position: 'absolute', left: g.portrait ? g.W / 2 - 90 : 900, top: g.portrait ? 1190 : 478, width: 180 * sub, height: 6, background: P.crimson, borderRadius: 3}} />
      <div style={{position: 'absolute', left: txtX, top: g.portrait ? 1230 : 508, width: txtW, textAlign: align, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.24em', color: P.olive, opacity: sub * 0.85}}>KUBWA · ABUJA · NIGERIA</div>
      <div style={{position: 'absolute', left: g.portrait ? 60 : 900, top: g.portrait ? 1380 : 600, width: g.portrait ? g.W - 120 : 900}}>
        <LyricBlock phrases={[L[0]]} size={g.portrait ? 92 : 84} align={align} light italic hold={0.2} lineGap={1.12} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ scene 3: the framed story
const PHOTOS = [
  {src: 'school-front.jpg', t0: B.framed, pos: '66% 50%', kb: {z0: 1.04, z1: 1.18, x0: 2, x1: -2}},
  {src: 'assembly.jpg', t0: L[2].start - 0.2, pos: '28% 50%', kb: {z0: 1.06, z1: 1.2, x0: -2, x1: 3, y0: 2, y1: -1}},
  {src: 'kids-writing.jpg', t0: L[3].start - 0.1, pos: '50% 40%', kb: {z0: 1.1, z1: 1.0, x0: -2, x1: 2}},
  {src: 'toddlers.jpg', t0: L[5].start - 0.2, pos: '50% 36%', kb: {z0: 1.04, z1: 1.18, x0: 2, x1: -2}},
  {src: 'students-red.jpg', t0: L[7].start - 0.3, pos: '50% 34%', kb: {z0: 1.16, z1: 1.03, y0: -2, y1: 1}},
  {src: 'kids-grass.jpg', t0: L[9].start - 0.15, pos: '50% 50%', kb: {z0: 1.02, z1: 1.16, x0: -3, x1: 3}},
  {src: 'science-lab.jpg', t0: L[11].start - 0.15, pos: '50% 46%', kb: {z0: 1.04, z1: 1.2, x0: 1, x1: -2}},
];

const Rings: React.FC<{t0: number; t1: number}> = ({t0, t1}) => {
  const t = useT();
  const g = useGeo();
  if (t < t0 || t > t1) return null;
  const cx = g.win.x + g.win.w * 0.55;
  const cy = g.win.y + g.win.h * 0.45;
  return (
    <svg width={g.W} height={g.H} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => {
        const k = (((t - t0) / 2.4 + i / 3) % 1 + 1) % 1;
        return <circle key={i} cx={cx} cy={cy} r={60 + k * 640} fill="none" stroke={P.gold} strokeWidth={3 + (1 - k) * 6} opacity={Math.sin(Math.PI * k) * 0.8 * clamp((t - t0) / 0.4) * clamp((t1 - t) / 0.4)} />;
      })}
    </svg>
  );
};

const Framed: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const pairSize = g.portrait ? 96 : 84;
  const chipPos = (n: number): React.CSSProperties => (g.portrait ? {left: 56, top: 960 - n * 0} : {left: 900, top: 900});
  const badgeIn = prog(t, L[10].start, 0.6, ease.back);
  const badgeOut = 1 - prog(t, L[10].end + 0.3, 0.3, ease.in);
  return (
    <AbsoluteFill>
      <Stage />
      <PhotoWindow items={PHOTOS} pulses={PULSES} tEnd={B.typo + 0.1} />
      <WindowEdge />
      <Rings t0={L[11].start} t1={L[11].end + 0.3} />

      {/* "Peter Harvard" / "We rise" intro */}
      <Zone>
        <Stamp t0={B.framed + 0.15} t1={L[1].start - 0.15}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, letterSpacing: '0.2em', color: P.gold}}>EST. 2017</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: P.cream, marginTop: 8}}>Kubwa, Abuja</div>
        </Stamp>
        <LyricBlock phrases={[L[1]]} size={g.portrait ? 150 : 120} hold={0.1} lineGap={1} />
        <LyricBlock phrases={[L[2]]} size={g.portrait ? 190 : 150} hold={0.1} lineGap={1} style={{position: 'absolute'}} />
      </Zone>
      <Sparks t0={L[2].start - 0.2} t1={L[2].end + 1.8} count={52} seed={9} />

      {/* verse */}
      <Zone>
        <LyricBlock phrases={[L[3], L[4]]} size={pairSize} hold={0.15} />
        <LyricBlock phrases={[L[5], L[6]]} size={pairSize} hold={0.15} style={{position: 'absolute'}} />
      </Zone>
      <Chip t0={L[3].start + 0.2} t1={L[4].end} label="QUALIFIED TEACHERS" icon={<Check />} style={chipPos(0)} />
      <Chip t0={L[5].start + 0.1} t1={L[6].end} label="A SAFE SPACE" icon={<Spark />} style={chipPos(0)} />

      {/* chorus */}
      <Zone>
        <LyricBlock phrases={[L[7], L[8]]} size={pairSize} hold={0.15} />
        <LyricBlock phrases={[L[9], L[10]]} size={pairSize} hold={0.2} style={{position: 'absolute'}} />
        <LyricBlock phrases={[L[11]]} size={g.portrait ? 100 : 84} hold={0.3} style={{position: 'absolute'}} />
      </Zone>
      <div
        style={{
          position: 'absolute',
          left: g.portrait ? 790 : 1500,
          top: g.portrait ? 70 : 70,
          width: 200,
          height: 200,
          borderRadius: 44,
          background: P.paper,
          display: badgeIn > 0 && badgeOut > 0 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
          transform: `scale(${lerp(0.4, 1, badgeIn) * lerp(0.6, 1, badgeOut)}) rotate(${lerp(-10, 0, badgeIn)}deg)`,
          opacity: badgeOut,
        }}
      >
        <Badge width={168} />
      </div>
      <Chip t0={L[11].start + 1.1} t1={L[11].end} label="GLOBAL LEADERS" icon={<Spark />} style={chipPos(0)} />
      <BrandStrip t0={B.framed + 0.4} t1={B.typo - 0.3} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ scene 4: Morally strong, academically strong
const BigWord: React.FC<{t0: number; t1: number; text: string; size: number; color: string; italic?: boolean; style?: React.CSSProperties}> = ({t0, t1, text, size, color, italic, style}) => (
  <Stamp t0={t0} t1={t1} style={style}>
    <div style={{fontFamily: SERIF, fontWeight: 900, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 0.98, color, letterSpacing: '-0.015em', whiteSpace: 'nowrap', textShadow: '0 8px 40px rgba(0,0,0,0.35)'}}>{text}</div>
  </Stamp>
);
const Typo: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const end = B.finale + 0.2;
  const m = L[12].words;
  const a = L[13].words;
  const s1 = g.portrait ? 196 : 210;
  const s2 = g.portrait ? 106 : 170;
  const dim = 1 - prog(t, a[0].t - 0.05, 0.3, ease.out) * 0.5;
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${P.crimson} 0%, ${P.crimsonDeep} 100%)`}}>
      <AbsoluteFill style={{background: `linear-gradient(115deg, rgba(0,0,0,0) 54%, ${P.olive} 54.2%, ${P.oliveDeep} 100%)`, opacity: 0.9}} />
      <Rays color="rgba(255,243,201,0.55)" opacity={0.16} cx="80%" cy="20%" speed={-4} />
      <div style={{position: 'absolute', left: g.portrait ? 80 : 150, top: g.portrait ? 360 : 140, opacity: dim}}>
        <BigWord t0={m[0].t - 0.05} t1={end} text="MORALLY" size={s1} color={P.cream} />
        <BigWord t0={m[1].t - 0.05} t1={end} text="STRONG." size={s1} color={P.gold} italic style={{marginTop: 8}} />
      </div>
      <div style={{position: 'absolute', left: g.portrait ? 80 : 150, top: g.portrait ? 1000 : 560}}>
        <BigWord t0={a[0].t - 0.05} t1={end} text="ACADEMICALLY" size={s2} color={P.cream} />
        <BigWord t0={a[1].t - 0.05} t1={end} text="STRONG." size={s2 * 1.18} color={P.gold} italic style={{marginTop: 8}} />
      </div>
      <div style={{position: 'absolute', left: g.portrait ? 80 : 150, top: g.portrait ? 300 : 90, width: 160 * prog(t, B.typo + 0.2, 0.5, ease.out), height: 8, background: P.gold, borderRadius: 4}} />
      <Sparks t0={a[0].t} t1={end} count={30} seed={21} maxSize={10} />
      <Flash t0={m[0].t - 0.05} peak={0.22} decay={9} />
      <Flash t0={a[0].t - 0.05} peak={0.22} decay={9} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ scene 5: finale
const Finale: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const t0 = B.finale;
  const p = prog(t, t0 + 0.1, 1.0, ease.out);
  const zoom = lerp(0.94, 1.06, clamp((t - t0) / (B.cta - t0)));
  const badgeW = g.portrait ? 860 : 700;
  const bx = g.portrait ? g.W / 2 : 520;
  const by = g.portrait ? 640 : g.H / 2;
  const pulse = 1 + 0.03 * Math.exp(-(t - L[14].start) * 6) * (t >= L[14].start ? 1 : 0) + 0.03 * Math.exp(-(t - L[15].start) * 6) * (t >= L[15].start ? 1 : 0);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${g.portrait ? '50% 33%' : '27% 50%'}, ${P.oliveMid} 0%, ${P.olive} 30%, ${P.oliveDeep} 68%, ${P.ink} 100%)`}}>
      <Rays cx={g.portrait ? '50%' : '27%'} cy={g.portrait ? '33%' : '50%'} color="rgba(246,185,59,0.6)" opacity={0.3} speed={7} />
      <div style={{position: 'absolute', left: bx - badgeW * 0.62, top: by - badgeW * 0.62, width: badgeW * 1.24, height: badgeW * 1.24, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,243,201,0.95) 0%, rgba(255,243,201,0.55) 38%, rgba(255,243,201,0) 68%)', opacity: p * 0.95}} />
      <div style={{position: 'absolute', left: bx - badgeW / 2, top: by - (badgeW * 0.877) / 2, opacity: p, transform: `scale(${zoom * pulse * lerp(0.85, 1, p)})`, filter: 'drop-shadow(0 28px 44px rgba(0,0,0,0.5))'}}>
        <Badge width={badgeW} />
      </div>
      <div style={{position: 'absolute', left: g.portrait ? 64 : 960, top: g.portrait ? 1190 : 300, width: g.portrait ? 952 : 880}}>
        <LyricBlock phrases={[L[14]]} size={g.portrait ? 100 : 98} hold={4} align={g.portrait ? 'center' : 'left'} lineGap={1.04} />
      </div>
      <div style={{position: 'absolute', left: g.portrait ? 64 : 960, top: g.portrait ? 1500 : 640, width: g.portrait ? 952 : 880}}>
        <LyricBlock phrases={[L[15]]} size={g.portrait ? 150 : 140} hold={2} italic align={g.portrait ? 'center' : 'left'} lineGap={1} />
      </div>
      <Sparks t0={L[15].start - 0.3} t1={B.cta + 0.3} count={70} seed={5} maxSize={16} />
      <Flash t0={L[14].start} peak={0.35} decay={8} color={P.gold} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ scene 6: end card
const PinIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const PhoneIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const GlobeIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
  </svg>
);
const NoteIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
);

const Row: React.FC<{t0: number; icon: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, icon, children, style}) => {
  const t = useT();
  const p = prog(t, t0, 0.55, ease.out);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: p, transform: `translateX(${(1 - p) * -40}px)`, ...style}}>
      <div style={{width: 76, height: 76, borderRadius: 22, background: P.crimson, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', boxShadow: '0 10px 24px rgba(193,18,31,0.35)'}}>{icon}</div>
      <div>{children}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const g = useGeo();
  const t0 = B.cta;
  const inP = prog(t, t0 + 0.1, 0.8, ease.back);
  const nameP = prog(t, t0 + 0.35, 0.6, ease.out);
  const fade = prog(t, cues.duration - 1.6, 1.5, ease.inOut);
  const tag = prog(t, 62.0, 0.6, ease.out);
  const qr = prog(t, 60.5, 0.6, ease.back);
  const T = SCHOOL;
  const lab: React.CSSProperties = {fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.2em', color: P.crimson, marginBottom: 4};
  const val: React.CSSProperties = {fontFamily: SANS, fontWeight: 800, fontSize: g.portrait ? 46 : 38, color: P.olive, lineHeight: 1.18};
  const left = g.portrait ? 78 : 1000;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${g.portrait ? '50% 12%' : '25% 45%'}, #FFFFFF 0%, ${P.paper} 45%, #F1DFA6 100%)`}}>
      <Rays cx={g.portrait ? '50%' : '25%'} cy={g.portrait ? '14%' : '45%'} color="rgba(246,185,59,0.5)" opacity={0.22} />
      {/* badge + name */}
      <div style={{position: 'absolute', left: g.portrait ? g.W / 2 - 250 : 230, top: g.portrait ? 90 : 230, transform: `scale(${lerp(0.7, 1, inP)})`, opacity: prog(t, t0, 0.2, ease.out), filter: 'drop-shadow(0 22px 30px rgba(53,51,0,0.3))'}}>
        <Badge width={g.portrait ? 500 : 520} />
      </div>
      <div style={{position: 'absolute', left: g.portrait ? 0 : 80, top: g.portrait ? 520 : 690, width: g.portrait ? g.W : 880, textAlign: 'center', opacity: nameP, transform: `translateY(${(1 - nameP) * 24}px)`}}>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: g.portrait ? 104 : 84, color: P.crimson, lineHeight: 1, whiteSpace: 'nowrap'}}>PETER HARVARD</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: g.portrait ? 34 : 30, letterSpacing: '0.32em', color: P.olive, marginTop: 12, marginRight: '-0.32em'}}>INTERNATIONAL SCHOOLS</div>
      </div>
      {/* contact rows */}
      <div style={{position: 'absolute', left, top: g.portrait ? 790 : 150, width: g.portrait ? 924 : 820, display: 'flex', flexDirection: 'column', gap: g.portrait ? 30 : 30}}>
        <Row t0={58.35} icon={<PinIcon />}>
          <div style={lab}>FIND US</div>
          <div style={val}>{T.address[0]}</div>
          <div style={val}>{T.address[1]}</div>
        </Row>
        <Row t0={59.25} icon={<PhoneIcon />}>
          <div style={lab}>CALL</div>
          <div style={{...val, fontSize: g.portrait ? 46 : 38}}>{T.phones[0]} · {T.phones[1]}</div>
          <div style={{...val, fontSize: g.portrait ? 46 : 38}}>{T.phones[2]}</div>
        </Row>
        <Row t0={60.25} icon={<GlobeIcon />}>
          <div style={lab}>VISIT</div>
          <div style={{...val, color: P.crimson, fontSize: g.portrait ? 38 : 42}}>{T.site}</div>
        </Row>
        <Row t0={61.1} icon={<NoteIcon />}>
          <div style={lab}>TIKTOK</div>
          <div style={val}>{T.tiktok}</div>
        </Row>
      </div>
      {/* QR */}
      <div style={{position: 'absolute', left: g.portrait ? 790 : 1560, top: g.portrait ? 1310 : 500, width: 220, padding: 18, borderRadius: 26, background: '#fff', boxShadow: '0 18px 40px rgba(53,51,0,0.25)', opacity: qr, transform: `scale(${lerp(0.7, 1, qr)})`, display: g.portrait ? 'block' : 'none'}}>
        <Img src={staticFile('ph/img/qr-site.svg')} style={{width: '100%', height: 'auto', display: 'block'}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 19, letterSpacing: '0.12em', color: P.olive, textAlign: 'center', marginTop: 8}}>SCAN TO VISIT</div>
      </div>
      {/* tagline + motto bar */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: g.portrait ? 250 : 150, background: `linear-gradient(135deg, ${P.crimson}, ${P.crimsonDeep})`, opacity: tag, transform: `translateY(${(1 - tag) * 60}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 50px', boxSizing: 'border-box', textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: g.portrait ? 62 : 46, color: P.cream}}>Responsibility &amp; Excellence</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: g.portrait ? 24 : 22, letterSpacing: '0.12em', lineHeight: 1.5, color: P.gold}}>{T.tagline.map((s) => s.toUpperCase()).join(g.portrait ? '\u00a0\u00a0·\u00a0\u00a0' : '  ·  ')}</div>
      </div>
      <AbsoluteFill style={{background: P.ink, opacity: fade}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ main
export const PhisAdvert: React.FC = () => {
  useFonts();
  const {width, height} = useVideoConfig();
  void width;
  void height;
  return (
    <TimeProvider>
      <AbsoluteFill style={{background: P.ink, overflow: 'hidden'}}>
        <Audio src={staticFile('ph/audio/soundtrack.wav')} />
        <Between a={0} b={DROP}>
          <Hook />
        </Between>
        <Between a={DROP} b={B.framed}>
          <Reveal />
        </Between>
        <Between a={B.framed} b={B.typo}>
          <Framed />
        </Between>
        <Between a={B.typo} b={B.finale}>
          <Typo />
        </Between>
        <Between a={B.finale} b={B.cta}>
          <Finale />
        </Between>
        <Between a={B.cta} b={cues.duration + 1}>
          <EndCard />
        </Between>
        <Wipe t0={B.framed - 0.35} />
        <Wipe t0={B.typo - 0.35} />
        <Wipe t0={B.finale - 0.35} />
        <Wipe t0={B.cta - 0.35} />
        <Flash t0={DROP} peak={0.95} decay={6} />
        <Vignette strength={0.38} />
        <Grain opacity={0.06} />
      </AbsoluteFill>
    </TimeProvider>
  );
};
