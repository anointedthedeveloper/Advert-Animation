import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, prog, clamp, lerp, rng} from '../util';
import {P, SANS, SERIF} from './theme';

// ------------------------------------------------------------------------------------------------ time and geometry
const TCtx = createContext(0);
/** Puts the global time (seconds) in context so every scene can be written in advert time, not scene-local frames. */
export const TimeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <TCtx.Provider value={f / fps}>{children}</TCtx.Provider>;
};
export const useT = () => useContext(TCtx);

type Rect = {x: number; y: number; w: number; h: number};
export type Geo = {
  portrait: boolean;
  W: number;
  H: number;
  win: Rect; // photo window
  clip: string;
  zone: Rect; // text zone
  brand: Rect;
  edge: [number, number][]; // the slanted edge of the photo window, left point then right point
};

const PORTRAIT: Geo = {
  portrait: true,
  W: 1080,
  H: 1920,
  win: {x: 0, y: 0, w: 1080, h: 1240},
  clip: 'polygon(0 0, 100% 0, 100% 100%, 0 91%)',
  zone: {x: 64, y: 1330, w: 952, h: 410},
  brand: {x: 64, y: 1768, w: 952, h: 112},
  edge: [
    [0, 1240 * 0.91],
    [1080, 1240],
  ],
};
const LANDSCAPE: Geo = {
  portrait: false,
  W: 1920,
  H: 1080,
  win: {x: 780, y: 0, w: 1140, h: 1080},
  clip: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
  zone: {x: 90, y: 190, w: 650, h: 600},
  brand: {x: 90, y: 900, w: 650, h: 112},
  edge: [
    [780 + 114, 0],
    [780, 1080],
  ],
};
export const useGeo = (): Geo => {
  const {width, height} = useVideoConfig();
  return height > width ? PORTRAIT : LANDSCAPE;
};

export const fit = (v: number) => v; // sizes are authored per layout, helper kept for readability

// ------------------------------------------------------------------------------------------------ small primitives
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const r = rng(Math.floor(f / 2) + 11);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('ph/img/grain.png')})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${Math.floor(r() * 512)}px ${Math.floor(r() * 512)}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.5}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(14,13,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);

export const Flash: React.FC<{t0: number; peak?: number; decay?: number; color?: string}> = ({t0, peak = 0.9, decay = 7, color = '#fff'}) => {
  const t = useT();
  if (t < t0 || t > t0 + 1.2) return null;
  const o = peak * Math.exp(-(t - t0) * decay);
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

/** Diagonal crimson / gold / olive panels that sweep across the screen. Scenes swap at the midpoint (t0 + dur / 2). */
export const Wipe: React.FC<{t0: number; dur?: number}> = ({t0, dur = 0.7}) => {
  const t = useT();
  const {width: W, height: H} = useVideoConfig();
  if (t < t0 || t > t0 + dur + 0.2) return null;
  const portrait = H > W;
  const layer = (delay: number, color: string, extra = 0) => {
    const p = prog(t, t0 + delay, dur - 0.2, ease.inOut);
    const x = lerp(-1.35, 1.1, p) * W;
    return (
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: x,
          width: W * (1.25 + extra),
          height: '120%',
          background: color,
          transform: `skewX(${portrait ? -9 : -14}deg)`,
          transformOrigin: 'center',
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      {layer(0.0, P.oliveDeep)}
      {layer(0.05, P.gold, -0.02)}
      {layer(0.1, P.crimson)}
    </AbsoluteFill>
  );
};

export const Badge: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => (
  <Img src={staticFile('ph/img/badge.png')} style={{width, height: 'auto', display: 'block', ...style}} />
);

/** Rising gold sparks (deterministic). */
export const Sparks: React.FC<{t0: number; t1: number; count?: number; seed?: number; color?: string; maxSize?: number}> = ({t0, t1, count = 46, seed = 3, color = P.gold, maxSize = 14}) => {
  const t = useT();
  const {width: W, height: H} = useVideoConfig();
  if (t < t0 || t > t1) return null;
  const fadeIn = clamp((t - t0) / 0.6);
  const fadeOut = clamp((t1 - t) / 0.8);
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({x: r(), delay: r() * 2.5, dur: 2.2 + r() * 2.2, size: 3 + r() * maxSize, sway: 20 + r() * 50, ph: r() * 6.28}));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: Math.min(fadeIn, fadeOut)}}>
      {items.map((s, i) => {
        const k = (((t - t0 + s.delay) / s.dur) % 1 + 1) % 1;
        const y = H * (1.05 - k * 1.2);
        const x = s.x * W + Math.sin(k * 6.28 + s.ph) * s.sway;
        const o = Math.sin(Math.PI * k) * 0.95;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s.size, height: s.size, borderRadius: '50%', opacity: o, background: `radial-gradient(circle, #fff 0%, ${color} 40%, rgba(246,185,59,0) 72%)`, boxShadow: `0 0 ${s.size * 2.2}px ${color}`}} />;
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ photos
export type KB = {z0?: number; z1?: number; x0?: number; x1?: number; y0?: number; y1?: number};
export const Photo: React.FC<{src: string; t0: number; t1: number; pos?: string; kb?: KB; pulses?: number[]; grade?: string}> = ({src, t0, t1, pos = '50% 50%', kb = {}, pulses = [], grade}) => {
  const t = useT();
  const {z0 = 1.04, z1 = 1.16, x0 = 0, x1 = 0, y0 = 0, y1 = 0} = kb;
  const p = clamp((t - t0) / Math.max(0.01, t1 - t0));
  const e = p * p * (3 - 2 * p) * 0.35 + p * 0.65; // nearly linear, soft ends
  let bump = 0;
  for (const q of pulses) if (t >= q) bump += 0.032 * Math.exp(-(t - q) * 6.5);
  const z = lerp(z0, z1, e) + bump;
  return (
    <Img
      src={staticFile('ph/img/' + src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: pos,
        transform: `translate(${lerp(x0, x1, e)}%, ${lerp(y0, y1, e)}%) scale(${z})`,
        filter: grade ?? 'saturate(1.12) contrast(1.06) brightness(1.02)',
      }}
    />
  );
};

export type PhotoItem = {src: string; t0: number; pos?: string; kb?: KB; end?: number};

/** The slanted photo window. Photos change with a crimson leading edge wiping across. `items` must be in time order. */
export const PhotoWindow: React.FC<{items: PhotoItem[]; pulses?: number[]; tEnd: number; opacity?: number}> = ({items, pulses = [], tEnd, opacity = 1}) => {
  const t = useT();
  const g = useGeo();
  const TR = 0.42;
  return (
    <div style={{position: 'absolute', left: g.win.x, top: g.win.y, width: g.win.w, height: g.win.h, clipPath: g.clip, overflow: 'hidden', opacity, background: P.oliveDeep}}>
      {items.map((it, i) => {
        const nextT = i + 1 < items.length ? items[i + 1].t0 : tEnd;
        if (t < it.t0 - 0.02 || t > nextT + TR + 0.05) return null;
        const p = i === 0 ? 1 : prog(t, it.t0, TR, ease.inOut);
        const horizontal = g.portrait; // wipe left to right in portrait, bottom to top in landscape
        const clip = horizontal ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(${(1 - p) * 100}% 0 0 0)`;
        const edge = p < 1 && i > 0;
        return (
          <div key={it.src + it.t0} style={{position: 'absolute', inset: 0, clipPath: clip, zIndex: i}}>
            <Photo src={it.src} t0={it.t0} t1={it.end ?? nextT} pos={it.pos} kb={it.kb} pulses={pulses} />
            {edge && (
              <div
                style={
                  horizontal
                    ? {position: 'absolute', top: 0, bottom: 0, left: `${p * 100}%`, width: 16, marginLeft: -16, background: P.crimson, boxShadow: `0 0 30px ${P.crimson}`}
                    : {position: 'absolute', left: 0, right: 0, top: `${(1 - p) * 100}%`, height: 16, background: P.crimson, boxShadow: `0 0 30px ${P.crimson}`}
                }
              />
            )}
          </div>
        );
      })}
      {/* warm grade + legibility gradient */}
      <AbsoluteFill style={{zIndex: 50, background: g.portrait ? 'linear-gradient(180deg, rgba(14,13,0,0.28) 0%, rgba(14,13,0,0) 22%, rgba(14,13,0,0) 62%, rgba(14,13,0,0.62) 100%)' : 'linear-gradient(90deg, rgba(14,13,0,0.55) 0%, rgba(14,13,0,0) 40%), linear-gradient(180deg, rgba(14,13,0,0.25) 0%, rgba(14,13,0,0) 25%)'}} />
      <AbsoluteFill style={{zIndex: 51, background: 'radial-gradient(circle at 85% 8%, rgba(246,185,59,0.22), rgba(246,185,59,0) 48%)', mixBlendMode: 'screen'}} />
    </div>
  );
};

/** Crimson band and cream hairline hugging the slanted edge of the photo window. */
export const WindowEdge: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const g = useGeo();
  const [a, b] = g.edge;
  const band = 22;
  const pts = g.portrait
    ? `${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0]},${b[1] + band} ${a[0]},${a[1] + band}`
    : `${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0] - band},${b[1]} ${a[0] - band},${a[1]}`;
  const line = g.portrait
    ? `${a[0]},${a[1] + band + 7} ${b[0]},${b[1] + band + 7} ${b[0]},${b[1] + band + 12} ${a[0]},${a[1] + band + 12}`
    : `${a[0] - band - 7},${a[1]} ${b[0] - band - 7},${b[1]} ${b[0] - band - 12},${b[1]} ${a[0] - band - 12},${a[1]}`;
  return (
    <svg width={g.W} height={g.H} style={{position: 'absolute', left: 0, top: 0, opacity}}>
      <polygon points={pts} fill={P.crimson} />
      <polygon points={line} fill={P.gold} />
    </svg>
  );
};

/** Dark olive stage behind the text zone, with faint diagonal pinstripes and a crimson glow. */
export const Stage: React.FC = () => {
  const g = useGeo();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at ${g.portrait ? '15% 100%' : '10% 100%'}, ${P.oliveMid} 0%, ${P.olive} 38%, ${P.oliveDeep} 78%, ${P.ink} 100%)`}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(115deg, rgba(255,243,201,0.035) 0px, rgba(255,243,201,0.035) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 26px)'}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at 90% 95%, rgba(193,18,31,0.38), rgba(193,18,31,0) 70%)`}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ brand strip
export const BrandStrip: React.FC<{t0: number; t1: number}> = ({t0, t1}) => {
  const t = useT();
  const g = useGeo();
  if (t < t0 || t > t1 + 0.4) return null;
  const a = Math.min(prog(t, t0, 0.5, ease.out), 1 - prog(t, t1, 0.35, ease.in));
  const s = g.portrait ? 1 : 1;
  return (
    <div style={{position: 'absolute', left: g.brand.x, top: g.brand.y, width: g.brand.w, height: g.brand.h, display: 'flex', alignItems: 'center', gap: 22 * s, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
      <div style={{width: 104, height: 104, borderRadius: 24, background: P.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', flex: '0 0 auto'}}>
        <Badge width={86} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.1em', color: P.cream}}>PETER HARVARD</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: g.portrait ? 21 : 16, letterSpacing: g.portrait ? '0.16em' : '0.1em', color: P.gold}}>INTERNATIONAL SCHOOLS · KUBWA, ABUJA</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------ lyrics
export type Word = {w: string; t: number; e: number};
export type Phrase = {start: number; end: number; text: string; words: Word[]};

const mixColor = (a: [number, number, number], b: [number, number, number], k: number) => `rgb(${Math.round(lerp(a[0], b[0], k))}, ${Math.round(lerp(a[1], b[1], k))}, ${Math.round(lerp(a[2], b[2], k))})`;
const CREAM: [number, number, number] = [255, 243, 201];
const GOLD: [number, number, number] = [246, 185, 59];
const INK: [number, number, number] = [53, 51, 0];
const CRIM: [number, number, number] = [193, 18, 31];

/**
 * Karaoke-style lyrics. Every phrase is on screen from just before it is sung; each word lights up (gold, then settles to
 * the base colour) at its time. `light` swaps the palette for use on the cream background.
 */
export const LyricBlock: React.FC<{phrases: Phrase[]; size: number; align?: 'left' | 'center'; light?: boolean; width?: number; italic?: boolean; lineGap?: number; hold?: number; style?: React.CSSProperties}> = ({phrases, size, align = 'left', light = false, width, italic = false, lineGap = 1.06, hold = 0.55, style}) => {
  const t = useT();
  const first = phrases[0].start;
  const last = phrases[phrases.length - 1].end;
  if (t < first - 0.3 || t > last + hold + 0.35) return null;
  const inP = prog(t, first - 0.28, 0.3, ease.out);
  const outP = prog(t, last + hold, 0.3, ease.in);
  const base = light ? INK : CREAM;
  const hi = light ? CRIM : GOLD;
  return (
    <div style={{opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 26 - outP * 14}px)`, width, textAlign: align, ...style}}>
      {phrases.map((ph, i) => (
        <div key={i} style={{fontFamily: SERIF, fontWeight: 900, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: lineGap, letterSpacing: '-0.01em', textShadow: light ? 'none' : '0 4px 26px rgba(0,0,0,0.5)'}}>
          {ph.words.map((w, j) => {
            const k = clamp((t - w.t) / 0.22);
            const settle = clamp((t - w.t - 0.1) / 0.6);
            const ek = ease.out(k);
            const color = k <= 0 ? mixColor(base, base, 0) : mixColor(hi, base, settle);
            return (
              <span key={j} style={{display: 'inline-block', marginRight: '0.26em', opacity: lerp(0.3, 1, ek), color, transform: `translateY(${(1 - ek) * 14}px) scale(${lerp(1, 1.0, ek) + (1 - settle) * 0.07 * (k > 0 ? 1 : 0)})`, transformOrigin: '50% 80%'}}>
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** One huge word that stamps in (scale-down impact). */
export const Stamp: React.FC<{t0: number; t1: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, t1, children, style}) => {
  const t = useT();
  if (t < t0 || t > t1 + 0.3) return null;
  const p = prog(t, t0, 0.28, ease.out);
  const o = Math.min(prog(t, t0, 0.12, ease.out), 1 - prog(t, t1, 0.2, ease.in));
  return <div style={{opacity: o, transform: `scale(${lerp(1.45, 1, p)}) translateY(${lerp(20, 0, p)}px)`, filter: `blur(${(1 - p) * 8}px)`, transformOrigin: '0% 70%', ...style}}>{children}</div>;
};

export const Chip: React.FC<{t0: number; t1: number; label: string; icon?: React.ReactNode; style?: React.CSSProperties}> = ({t0, t1, label, icon, style}) => {
  const t = useT();
  if (t < t0 || t > t1 + 0.3) return null;
  const p = prog(t, t0, 0.45, ease.back);
  const o = Math.min(prog(t, t0, 0.2, ease.out), 1 - prog(t, t1, 0.25, ease.in));
  return (
    <div style={{position: 'absolute', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px 14px 18px', borderRadius: 999, background: P.paper, color: P.crimson, fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: '0.08em', boxShadow: '0 12px 34px rgba(0,0,0,0.38)', opacity: o, transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.8, 1, p)})`, ...style}}>
      <div style={{width: 42, height: 42, borderRadius: '50%', background: P.crimson, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      {label}
    </div>
  );
};

export const Check: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Spark: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" />
  </svg>
);
