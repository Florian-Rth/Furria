import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesPartProps {
  start: number;
  end: number;
  name: string;
  shade: boolean;
  current: boolean;
}

export const KkFocusLanesPart: FC<KkFocusLanesPartProps> = ({
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
      borderLeft: `${kkTokens.line.section}px solid ${palette(theme).text.primary}`,
      '&[data-shade="true"]': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 4%, transparent)`,
      },
    })}
  >
    <Typography
      component="span"
      variant="overline"
      sx={{
        position: 'sticky',
        left: 0,
        display: 'block',
        px: 0.75,
        lineHeight: '1.125rem',
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
