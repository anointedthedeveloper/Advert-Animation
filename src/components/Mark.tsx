import React from 'react';
import {Img, staticFile} from 'remotion';
import {useCurrentFrame} from '../frame';
import {ease, prog} from '../util';

const SRC = 'brand/exambox-mark.png';

/** The official Exam Box mark, displayed untouched (public/brand/exambox-mark.png). */
export const MarkImg: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img src={staticFile(SRC)} style={{width: size, height: size, display: 'block', ...style}} />
);

/**
 * The mark seated on a white plate (like an app icon) so its greens keep full contrast on the dark
 * background. The artwork itself is never recoloured, redrawn or stretched.
 * An optional light sweep crosses the plate.
 */
export const LogoTile: React.FC<{size: number; sweepAt?: number; style?: React.CSSProperties}> = ({size, sweepAt, style}) => {
  const f = useCurrentFrame();
  const t = sweepAt === undefined ? -1 : prog(f, sweepAt, 26, ease.inOut);
  const pos = t * 170 - 60;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.6) inset',
        ...style,
      }}
    >
      <MarkImg size={size * 0.8} style={{position: 'absolute', left: size * 0.1, top: size * 0.1}} />
      {t > 0 && t < 1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, rgba(167,243,208,0) ${pos}%, rgba(167,243,208,0.85) ${pos + 14}%, rgba(167,243,208,0) ${pos + 28}%)`,
          }}
        />
      )}
    </div>
  );
};
