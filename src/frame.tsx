import React, {createContext, useContext} from 'react';
import {useCurrentFrame as remotionFrame} from 'remotion';

const ScaleCtx = createContext(1);

/** Plays a scene's internal timeline `k` times faster (scene length = designed length / k). */
export const TimeScale: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => (
  <ScaleCtx.Provider value={k}>{children}</ScaleCtx.Provider>
);

/** Drop-in replacement for Remotion's useCurrentFrame that honours the surrounding TimeScale. */
export const useCurrentFrame = () => remotionFrame() * useContext(ScaleCtx);
