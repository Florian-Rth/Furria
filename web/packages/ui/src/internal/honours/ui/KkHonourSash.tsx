import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { tiltTransformOf } from '../honour-geometry';
import type { MotionStaging } from '../honour-motion';
import { sashTransition, settledAt } from '../honour-motion';
import { sashBandPaint, sashEdgePaint } from '../honour-paint';
import type { SashMode } from '../honour-sash';
import { sashLayoutOf } from '../honour-sash';
import type { KkAvatarFunction } from '../honour-types';
import { urlOf } from '../svg-id';
import { KkHonourSashIcon } from './KkHonourSashIcon';
import { KkHonourSashName } from './KkHonourSashName';

const TILT_DEGREES = -16;
const SLIDE_REACH = 1.2;
const NAME_LOCALE = 'de-DE';
const IN_PLACE = { x: 0 } as const;
const STILL = settledAt(IN_PLACE);

interface KkHonourSashProps {
  center: number;
  radius: number;
  mode: SashMode;
  entry: KkAvatarFunction;
  clipId: string;
  arrive: boolean;
}

export const KkHonourSash: FC<KkHonourSashProps> = ({
  center,
  radius,
  mode,
  entry,
  clipId,
  arrive,
}) => {
  const name = entry.short.toLocaleUpperCase(NAME_LOCALE);
  const letters = mode === 'text' ? Array.from(name).length : 0;
  const layout = sashLayoutOf(center, radius, mode, letters);
  const tilt = tiltTransformOf(TILT_DEGREES, center);
  const clipUrl = urlOf(clipId);
  const slide: MotionStaging = arrive
    ? {
        initial: { x: -layout.band.width * SLIDE_REACH },
        animate: IN_PLACE,
        transition: sashTransition,
      }
    : STILL;

  const edges = layout.edges.map((edge) => (
    <Box
      key={edge.y}
      component="rect"
      x={edge.x}
      y={edge.y}
      width={edge.width}
      height={edge.height}
      sx={sashEdgePaint}
    />
  ));
  const icon =
    layout.icon === null ? null : <KkHonourSashIcon icon={entry.icon} place={layout.icon} />;
  const text = layout.text === null ? null : <KkHonourSashName name={name} place={layout.text} />;

  return (
    <>
      <clipPath id={clipId}>
        <circle cx={center} cy={center} r={radius} />
      </clipPath>
      <g clipPath={clipUrl} data-kk-honour-sash>
        <g transform={tilt}>
          <motion.g initial={slide.initial} animate={slide.animate} transition={slide.transition}>
            <Box
              component="rect"
              x={layout.band.x}
              y={layout.band.y}
              width={layout.band.width}
              height={layout.band.height}
              sx={sashBandPaint}
            />
            {edges}
            {icon}
            {text}
          </motion.g>
        </g>
      </g>
    </>
  );
};
