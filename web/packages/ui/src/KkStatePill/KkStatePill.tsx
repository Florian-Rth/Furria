import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkStateMark } from './KkStateMark';
import { statePillGround } from './state-paint';
import type { KkStepState } from './step-state';

interface KkStatePillProps {
  state: KkStepState;
  label: string;
  sx?: KkSx;
}

export const KkStatePill: FC<KkStatePillProps> = ({ state, label, sx }) => {
  const text =
    label === '' ? null : (
      <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </Box>
    );

  return (
    <Stack
      component="span"
      direction="row"
      data-kk-state-pill={state}
      sx={[
        (theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 0.75,
          maxWidth: '100%',
          minWidth: 0,
          minHeight: '1.25rem',
          px: 0.875,
          py: 0.25,
          ml: -0.875,
          borderRadius: `${kkTokens.radius.bar}px`,
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: kkTokens.type.tracking.tight,
          whiteSpace: 'nowrap',
          ...statePillGround(theme, state),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkStateMark state={state} />
      {text}
    </Stack>
  );
};
