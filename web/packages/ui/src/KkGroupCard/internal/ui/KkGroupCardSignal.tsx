import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

const DOT_SIZE = 6;

interface KkGroupCardSignalProps {
  label: string;
}

export const KkGroupCardSignal: FC<KkGroupCardSignalProps> = ({ label }) => (
  <Stack
    direction="row"
    component="p"
    data-kk-group-card-signal
    sx={(theme) => ({
      m: 0,
      alignItems: 'center',
      gap: 0.75,
      minWidth: 0,
      ...theme.typography.caption,
      fontWeight: 800,
      letterSpacing: kkTokens.type.tracking.tight,
      lineHeight: 1.3,
      ...goldInkOf(theme),
    })}
  >
    <Box
      aria-hidden
      component="span"
      sx={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
      }}
    />
    {label}
  </Stack>
);
