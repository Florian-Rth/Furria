import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import type { GlassDropArrival } from '../logic/glass-drop-text';
import { filterIdOf } from '../logic/glass-drop-text';
import { GlassDropRippleFilter } from './GlassDropRippleFilter';

const AT_REST = { opacity: 1, x: 0, y: 0 };
const SURFACE = { type: 'spring', stiffness: 260, damping: 15, mass: 0.8 } as const;
const OPACITY_SECONDS = 0.24;

interface GlassDropRippleProps extends PropsWithChildren {
  arrival: GlassDropArrival | null;
  live: boolean;
}

export const GlassDropRipple: FC<GlassDropRippleProps> = ({ arrival, live, children }) => {
  const id = filterIdOf(useId());
  const wave = live ? (arrival?.wave ?? null) : null;
  const style: CSSProperties = {
    display: 'grid',
    minWidth: 0,
    filter: wave === null ? 'none' : `url(#${id})`,
  };
  const initial = arrival === null ? false : { opacity: 0, x: arrival.from.x, y: arrival.from.y };
  const opacitySeconds = arrival?.wave === null ? arrival.duration : OPACITY_SECONDS;
  const delay = arrival?.delay ?? 0;
  const transition = {
    opacity: { duration: opacitySeconds, delay },
    x: { ...SURFACE, delay },
    y: { ...SURFACE, delay },
  };
  const filter = wave === null ? null : <GlassDropRippleFilter id={id} wave={wave} />;

  return (
    <motion.span style={style} initial={initial} animate={AT_REST} transition={transition}>
      {filter}
      {children}
    </motion.span>
  );
};
