import React, {useState, useEffect} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {TimeScale} from './frame';
import {LayoutProvider, Layout} from './layout';
import {Background} from './components/Background';
import {PaperDissolve} from './components/PaperDissolve';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Reveal} from './scenes/Scene2Reveal';
import {SceneQuestions} from './scenes/SceneQuestions';
import {Scene3Network} from './scenes/Scene3Network';
import {Scene4Start} from './scenes/Scene4Start';
import {Scene5Monitor} from './scenes/Scene5Monitor';
import {Scene6Marking} from './scenes/Scene6Marking';
import {Scene7Reports} from './scenes/Scene7Reports';
import {Scene8Finale} from './scenes/Scene8Finale';

const S = timing.scenes;
const seq = (s: {from: number; to: number}) => ({from: s.from, durationInFrames: s.to - s.from});

const FONT_FILES: [number, string][] = [
  [400, 'Inter-Regular.otf'],
  [500, 'Inter-Medium.otf'],
  [600, 'Inter-SemiBold.otf'],
  [700, 'Inter-Bold.otf'],
  [800, 'Inter-ExtraBold.otf'],
  [900, 'Inter-Black.otf'],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Inter'));
  useEffect(() => {
    Promise.all(
      FONT_FILES.map(([w, file]) => {
        const face = new FontFace('Inter', `url(${staticFile('fonts/' + file)})`, {weight: String(w)});
        return face.load().then((loaded) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded));
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => {
        throw e;
      });
  }, [handle]);
};

/** WhatsApp status is limited to 30 s, so the vertical cut is rendered as two parts; this labels them. */
const PartBadge: React.FC = () => {
  const f = useCurrentFrame();
  const split = timing.statusSplit;
  let text: string | null = null;
  if (f < 90) text = 'Part 1 of 2';
  else if (f >= split - 80 && f < split) text = 'Part 2 next  →';
  else if (f >= split && f < split + 90) text = 'Part 2 of 2';
  if (!text) return null;
  const inEdge = f < 90 ? f : f >= split ? f - split : f - (split - 80);
  const len = f < 90 ? 90 : f >= split ? 90 : 80;
  const o = Math.min(1, inEdge / 10, (len - inEdge) / 10);
  return (
    <div style={{position: 'absolute', right: 40, top: 154, opacity: Math.max(0, o), padding: '10px 20px', borderRadius: 999, background: 'rgba(2,44,34,0.78)', border: '1.5px solid rgba(167,243,208,0.6)', color: '#A7F3D0', fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '0.04em'}}>
      {text}
    </div>
  );
};

export const Advert: React.FC<{layout?: Layout; partLabels?: boolean}> = ({layout = 'landscape', partLabels = true}) => {
  useFonts();
  return (
    <LayoutProvider layout={layout}>
    <AbsoluteFill style={{background: '#022C22', overflow: 'hidden'}}>
      <Audio src={staticFile('audio/soundtrack.wav')} />
      <Background />
      <Sequence {...seq(S.hook)} name="1 Hook">
        <Scene1Hook />
      </Sequence>
      <PaperDissolve />
      <Sequence {...seq(S.reveal)} name="2 Reveal">
        <Scene2Reveal />
      </Sequence>
      <Sequence {...seq(S.questions)} name="3 Question bank">
        <TimeScale k={S.questions.scale}>
          <SceneQuestions />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.network)} name="4 Network">
        <TimeScale k={S.network.scale}>
          <Scene3Network />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.start)} name="5 Start">
        <TimeScale k={S.start.scale}>
          <Scene4Start />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.monitor)} name="6 Monitor">
        <TimeScale k={S.monitor.scale}>
          <Scene5Monitor />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.marking)} name="7 Marking">
        <TimeScale k={S.marking.scale}>
          <Scene6Marking />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.reports)} name="8 Reports">
        <TimeScale k={S.reports.scale}>
          <Scene7Reports />
        </TimeScale>
      </Sequence>
      <Sequence {...seq(S.finale)} name="9 Finale">
        <Scene8Finale />
      </Sequence>
      {layout === 'portrait' && partLabels && <PartBadge />}
    </AbsoluteFill>
    </LayoutProvider>
  );
};
