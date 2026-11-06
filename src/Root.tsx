import React from 'react';
import {Composition} from 'remotion';
import {Advert} from './Advert';
import timing from './timing.json';

/** WhatsApp status allows 30 seconds at most, so the portrait cut stops a hair short of it. */
const STATUS_FRAMES = 897; // 29.9 s

export const Root: React.FC = () => (
  <>
    <Composition id="ExamBoxAdvert" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={timing.width} height={timing.height} defaultProps={{layout: 'landscape' as const}} />
    <Composition id="ExamBoxStatus" component={Advert} durationInFrames={STATUS_FRAMES} fps={timing.fps} width={1080} height={1920} defaultProps={{layout: 'portrait' as const}} />
  </>
);
