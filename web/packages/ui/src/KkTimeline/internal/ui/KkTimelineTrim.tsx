import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { waveBottom, waveTop } from '../timeline-paint';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkTimelineTrimProps {
  from: number;
  to: number;
}

export const KkTimelineTrim: FC<KkTimelineTrimProps> = ({ from, to }) => {
  const place = {
    left: percentOf(Math.min(from, to)),
    width: percentOf(Math.abs(to - from)),
  };

  return (
    <Box
      aria-hidden
      data-kk-timeline-trim
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: waveTop,
        bottom: waveBottom,
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${palette(theme).warning.main} 55%, transparent) 0 2px, transparent 2px 7px)`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).warning.main} 14%, transparent)`,
      })}
    />
  );
};
