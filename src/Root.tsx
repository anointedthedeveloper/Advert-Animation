import React from 'react';
import {Composition} from 'remotion';
import {Advert} from './Advert';
import timing from './timing.json';

/**
 * ExamBoxAdvert  16:9 film.
 * ExamBoxStatus  the same film laid out 9:16 for WhatsApp status. Status clips are limited to 30 s, so it is rendered in
 *                two parts (frames 0 to statusSplit-1 and statusSplit to the end); see scripts/render.mjs.
 */
export const Root: React.FC = () => (
  <>
    <Composition id="ExamBoxAdvert" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={timing.width} height={timing.height} defaultProps={{layout: 'landscape' as const}} />
    <Composition id="ExamBoxStatus" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={1080} height={1920} defaultProps={{layout: 'portrait' as const}} />
  </>
);
