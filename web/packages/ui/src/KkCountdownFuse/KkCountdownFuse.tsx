import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEyebrow } from '../KkEyebrow';
import { stepFigures } from '../KkStatePill/state-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const FUSE_WIDTH = '2.75rem';
const FUSE_HEIGHT = kkTokens.line.page;
const PERCENT = 100;

interface KkCountdownFuseProps {
  value: string;
  unit: string;
  label: string;
  remaining: number | null;
  tone?: 'ink' | 'quiet';
  sx?: KkSx;
}

export const KkCountdownFuse: FC<KkCountdownFuseProps> = ({
  value,
  unit,
  label,
  remaining,
  tone = 'ink',
  sx,
}) => {
  const ink = tone === 'quiet' ? 'text.disabled' : 'text.primary';
  const share = remaining === null ? 0 : Math.min(Math.max(remaining, 0), 1);
  const fuse =
    remaining === null ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          display: 'block',
          width: FUSE_WIDTH,
          height: FUSE_HEIGHT,
          borderRadius: `${kkTokens.radius.bar}px`,
          bgcolor: 'divider',
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'block',
            width: `${share * PERCENT}%`,
            height: '100%',
            borderRadius: 'inherit',
            bgcolor: ink,
          }}
        />
      </Box>
    );

  return (
    <Stack
      role="img"
      aria-label={label}
      data-kk-countdown-fuse
      sx={[
        { flexShrink: 0, alignItems: 'flex-end', rowGap: 0.5 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        component="span"
        aria-hidden
        variant="h3"
        sx={{ ...stepFigures, lineHeight: 0.9, color: ink }}
      >
        {value}
      </Typography>
      {fuse}
      <KkEyebrow tone="muted" sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
        {unit}
      </KkEyebrow>
    </Stack>
  );
};
