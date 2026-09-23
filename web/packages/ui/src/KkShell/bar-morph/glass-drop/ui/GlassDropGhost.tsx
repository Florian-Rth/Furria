import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { useId } from 'react';
import { GlassDropGhostLayer } from '../layout/GlassDropGhostLayer';
import type { GlassDropLine } from '../logic/glass-drop-plan';
import type { GlassDropDeparture } from '../logic/glass-drop-text';
import { filterIdOf } from '../logic/glass-drop-text';
import { GlassDropGhostLine } from './GlassDropGhostLine';
import { GlassDropRippleFilter } from './GlassDropRippleFilter';

const PRESENT = { opacity: 1, x: 0, y: 0 };

interface GlassDropGhostProps {
  line: GlassDropLine;
  departure: GlassDropDeparture;
}

export const GlassDropGhost: FC<GlassDropGhostProps> = ({ line, departure }) => {
  const id = filterIdOf(useId());
  const style: CSSProperties = {
    display: 'grid',
    minWidth: 0,
    filter: departure.wave === null ? 'none' : `url(#${id})`,
  };
  const animate = { opacity: 0, x: departure.to.x, y: departure.to.y };
  const transition = { duration: departure.duration, ease: 'easeIn' } as const;
  const filter =
    departure.wave === null ? null : <GlassDropRippleFilter id={id} wave={departure.wave} />;

  return (
    <GlassDropGhostLayer>
      <motion.span style={style} initial={PRESENT} animate={animate} transition={transition}>
        {filter}
        <GlassDropGhostLine line={line} />
      </motion.span>
    </GlassDropGhostLayer>
  );
};
