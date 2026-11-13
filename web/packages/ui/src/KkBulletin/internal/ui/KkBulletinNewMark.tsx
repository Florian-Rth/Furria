import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const DOT = '0.5rem';

const dotPaint = (theme: Theme) => ({
  width: DOT,
  height: DOT,
  borderRadius: '50%',
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  animation: kkTokens.motion.breath,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

interface KkBulletinNewMarkProps {
  label: string;
  sx?: KkSx;
}

export const KkBulletinNewMark: FC<KkBulletinNewMarkProps> = ({ label, sx }) => (
  <Stack
    direction="row"
    component="span"
    sx={[{ alignItems: 'center', gap: 0.5, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Stack component="span" aria-hidden sx={dotPaint} />
    <Typography
      component="span"
      variant="overline"
      sx={[{ ...kkTokens.eyebrow, lineHeight: 1 }, redInk]}
    >
      {label}
    </Typography>
  </Stack>
);
