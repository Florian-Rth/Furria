import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkClockReadoutProps {
  label: string;
  time: string | MotionValue<string>;
  count: string | MotionValue<string>;
}

export const KkClockReadout: FC<KkClockReadoutProps> = ({ label, time, count }) => (
  <Stack
    role="status"
    aria-label={label}
    data-kk-clock-readout
    sx={(theme) => ({
      flexShrink: 0,
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 0.25,
      minWidth: '4rem',
      px: 0.75,
      minHeight: kkTokens.tapTarget,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
    })}
  >
    <Typography
      component="span"
      variant="body2"
      sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
    >
      <motion.span>{time}</motion.span>
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'text.secondary',
        lineHeight: 1,
      }}
    >
      <motion.span>{count}</motion.span>
    </Typography>
  </Stack>
);
