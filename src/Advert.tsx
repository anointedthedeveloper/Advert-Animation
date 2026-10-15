import React, {useState, useEffect} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import timing from './timing.json';
import {TimeScale} from './frame';
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

export const Advert: React.FC = () => {
  useFonts();
  return (
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
        <SceneQuestions />
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
    </AbsoluteFill>
  );
};
