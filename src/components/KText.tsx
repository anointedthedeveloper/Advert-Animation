import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {ease, prog} from '../util';

export type Word = {t: string; color?: string; weight?: number};

/**
 * Kinetic typography: every word rises out of its own mask, staggered.
 * `lines` is an array of lines; each line an array of words.
 */
export const KText: React.FC<{
  lines: Word[][];
  start: number;
  size: number;
  stagger?: number;
  exitAt?: number;
  align?: 'left' | 'center';
  weight?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  gap?: number;
}> = ({lines, start, size, stagger = 4, exitAt, align = 'left', weight = 800, color = C.white, lineHeight = 1.04, letterSpacing = -0.03, gap = 0.26}) => {
  const f = useCurrentFrame();
  let idx = 0;
  const exit = exitAt === undefined ? 0 : prog(f, exitAt, 10, ease.in);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        textAlign: align,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 24}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', flexWrap: 'nowrap', gap: `${gap}em`, paddingBottom: '0.08em'}}
        >
          {line.map((w, wi) => {
            const p = prog(f, start + idx++ * stagger, 20, ease.out);
            return (
              <span key={wi} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em'}}>
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(1 - p) * 112}%)`,
                    opacity: Math.min(1, p * 3),
                    color: w.color,
                    fontWeight: w.weight,
                    whiteSpace: 'pre',
                  }}
                >
                  {w.t}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
