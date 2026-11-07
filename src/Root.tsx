import React from 'react';
import {Composition} from 'remotion';
import {Advert} from './Advert';
import timing from './timing.json';
import {PhisAdvert} from './ph/PhisAdvert';
import phCues from './ph/cues.json';

/**
 * ExamBoxAdvert  16:9 film.
 * ExamBoxStatus      the same film laid out 9:16 for WhatsApp status, cut into two parts (frames 0 to statusSplit-1 and
 *                     statusSplit to the end, with "Part" labels) for versions of WhatsApp that limit status to 30 s.
 * ExamBoxStatusFull  the whole 45 s film laid out 9:16 as ONE video, no labels. See scripts/render.mjs.
 */
export const Root: React.FC = () => (
  <>
    <Composition id="ExamBoxAdvert" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={timing.width} height={timing.height} defaultProps={{layout: 'landscape' as const}} />
    <Composition id="ExamBoxStatus" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={1080} height={1920} defaultProps={{layout: 'portrait' as const}} />
    <Composition id="ExamBoxStatusFull" component={Advert} durationInFrames={timing.totalFrames} fps={timing.fps} width={1080} height={1920} defaultProps={{layout: 'portrait' as const, partLabels: false}} />
    {/* Peter Harvard International Schools: 9:16 for TikTok / Reels / WhatsApp status, and 16:9 for YouTube / Facebook / the website */}
    <Composition id="PeterHarvardAdvert" component={PhisAdvert} durationInFrames={phCues.frames} fps={phCues.fps} width={1080} height={1920} />
    <Composition id="PeterHarvardAdvertTikTok" component={PhisAdvert} durationInFrames={phCues.frames} fps={phCues.fps} width={1080} height={1920} defaultProps={{variant: 'tiktok' as const}} />
    <Composition id="PeterHarvardAdvertWide" component={PhisAdvert} durationInFrames={phCues.frames} fps={phCues.fps} width={1920} height={1080} />
  </>
);
