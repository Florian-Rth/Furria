import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { COUNT_BAND_VAR } from '../timeline-paint';
import { CUT_LABEL, watchWholeLabel } from '../watch-whole-label';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkTimelineMark {
  key: string;
  share: number;
  strong: boolean;
  text: string | null;
}

interface KkTimelineMarksProps {
  ticks: readonly KkTimelineMark[];
  edge: 'top' | 'bottom';
}

export const KkTimelineMarks: FC<KkTimelineMarksProps> = ({ ticks, edge }) => {
  const marks = ticks.map((tick) => {
    const text =
      tick.text === null ? null : (
        <Typography
          component="span"
          variant="caption"
          data-kk-timeline-count-text
          ref={watchWholeLabel}
          sx={{
            position: 'absolute',
            [edge]: 0,
            left: '0.25rem',
            lineHeight: `var(${COUNT_BAND_VAR})`,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
            color: tick.strong ? 'text.primary' : 'text.secondary',
            ...CUT_LABEL,
          }}
        >
          {tick.text}
        </Typography>
      );

    return (
      <Box
        key={tick.key}
        data-strong={tick.strong}
        style={{ left: percentOf(tick.share) }}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            [edge === 'top' ? 'bottom' : 'top']: 0,
            left: 0,
            height: '28%',
            borderLeft: `${kkTokens.line.hair / 1.5}px solid ${palette(theme).divider}`,
          },
          '&[data-strong="true"]::before': {
            height: '100%',
            borderLeftColor: `color-mix(in srgb, ${palette(theme).text.primary} 30%, transparent)`,
          },
        })}
      >
        {text}
      </Box>
    );
  });

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
