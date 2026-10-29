import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import type { KkStudioCCut } from '../../studio-c-types';
import { stickyLabelOf } from '../sticky-label';
import { wavePathOf } from '../wave-path';

const WAVE_HEIGHT = 100;

const wavePaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: '34%',
  width: '100%',
  height: '62%',
  '& path': { fill: (theme.vars ?? theme).palette.text.disabled },
});

const cutPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  pl: 0.5,
  borderLeftWidth: kkTokens.line.section,
  borderLeftStyle: 'solid',
  borderLeftColor: (theme.vars ?? theme).palette.warning.main,
  pointerEvents: 'none',
});

interface KkStudioCTimelineWaveProps {
  values: readonly number[];
  width: number;
  cuts: readonly KkStudioCCut[];
}

export const KkStudioCTimelineWave: FC<KkStudioCTimelineWaveProps> = ({ values, width, cuts }) => {
  const viewBox = `0 0 ${Math.max(1, width)} ${WAVE_HEIGHT}`;
  const shape = wavePathOf(values, width, WAVE_HEIGHT);
  const marks = cuts.map((cut) => {
    const place = { left: cut.x };
    const sticky = stickyLabelOf(cut.x, cut.width);

    return (
      <Box key={cut.key} style={place} sx={cutPaint}>
        <Typography
          component="span"
          style={sticky}
          sx={(theme) => ({
            display: 'block',
            typography: 'caption',
            fontWeight: 800,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            ...goldInkOf(theme),
          })}
        >
          {cut.label}
        </Typography>
      </Box>
    );
  });

  return (
    <>
      <Box
        component="svg"
        aria-hidden
        viewBox={viewBox}
        preserveAspectRatio="none"
        data-kk-studio-c-wave
        sx={wavePaint}
      >
        <path d={shape} />
      </Box>
      {marks}
    </>
  );
};
