import React, {createContext, useContext} from 'react';

export type Layout = 'landscape' | 'portrait';

const LayoutCtx = createContext<Layout>('landscape');

/** Provides the layout (16:9 landscape or 9:16 portrait for WhatsApp status) to every scene. */
export const LayoutProvider: React.FC<{layout: Layout; children: React.ReactNode}> = ({layout, children}) => (
  <LayoutCtx.Provider value={layout}>{children}</LayoutCtx.Provider>
);

export const useLayout = () => useContext(LayoutCtx);
export const useIsPortrait = () => useContext(LayoutCtx) === 'portrait';

/**
 * Re-places a block that was designed in landscape coordinates. In landscape it renders its children untouched; in
 * portrait it scales the block uniformly so `from.w` becomes `to.w` and moves its top-left corner to `to.x, to.y`.
 */
export const Fit: React.FC<{from: {x: number; y: number; w: number}; to: {x: number; y: number; w: number}; children: React.ReactNode}> = ({from, to, children}) => {
  if (!useIsPortrait()) return <>{children}</>;
  const s = to.w / from.w;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transformOrigin: '0 0',
        transform: `translate(${to.x - from.x * s}px, ${to.y - from.y * s}px) scale(${s})`,
      }}
    >
      {children}
    </div>
  );
};
