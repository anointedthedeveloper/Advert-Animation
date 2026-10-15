import React from 'react';
import {Composition} from 'remotion';
import {Advert} from './Advert';
import timing from './timing.json';

export const Root: React.FC = () => (
  <Composition
    id="ExamBoxAdvert"
    component={Advert}
    durationInFrames={timing.totalFrames}
    fps={timing.fps}
    width={timing.width}
    height={timing.height}
  />
);
