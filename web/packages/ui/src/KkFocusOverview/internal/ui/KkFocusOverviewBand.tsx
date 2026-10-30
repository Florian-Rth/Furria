import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const PERCENT = 100;

interface KkFocusOverviewBandProps {
  start: number;
  end: number;
  name: string;
  shade: boolean;
  current: boolean;
}

export const KkFocusOverviewBand: FC<KkFocusOverviewBandProps> = ({
  start,
  end,
  name,
  shade,
  current,
}) => (
  <Box
    aria-hidden
    data-shade={shade}
    data-current={current}
    style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      pointerEvents: 'none',
      borderLeft: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 3%, transparent)`,
      '&[data-shade="true"]': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 8%, transparent)`,
      },
      '&[data-current="true"]': {
        boxShadow: `inset 0 -${kkTokens.line.page}px 0 ${palette(theme).text.primary}`,
      },
    })}
  >
    <Typography
      component="span"
      variant="overline"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        px: 0.5,
        lineHeight: '1rem',
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.label,
        whiteSpace: 'nowrap',
        color: current ? 'text.primary' : 'text.secondary',
      }}
    >
      {name}
    </Typography>
  </Box>
);
