import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneBarReadoutProps {
  label: string;
  time: string;
  count: string;
}

export const KkLaneBarReadout: FC<KkLaneBarReadoutProps> = ({ label, time, count }) => (
  <Stack
    direction="row"
    role="status"
    aria-label={label}
    sx={(theme) => ({
      flexShrink: 0,
      alignItems: 'baseline',
      gap: 1,
      px: 1.25,
      minHeight: kkTokens.tapTarget,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
      pt: 0.75,
    })}
  >
    <Typography
      component="span"
      variant="h4"
      sx={{ fontVariantNumeric: 'tabular-nums', minWidth: '4.6ch', lineHeight: 1 }}
    >
      {time}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'text.secondary',
        minWidth: '5ch',
        lineHeight: 1,
      }}
    >
      {count}
    </Typography>
  </Stack>
);
