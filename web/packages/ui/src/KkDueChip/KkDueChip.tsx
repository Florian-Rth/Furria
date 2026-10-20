import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { tonePaint } from '../internal/tone';
import { KkIcon } from '../KkIcon';
import { KkStateGlyph } from '../KkStatePill/KkStateGlyph';
import { stepFigures } from '../KkStatePill/state-paint';
import type { KkStepState } from '../KkStatePill/step-state';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const CLOCK_EXTENT = '0.875rem';

const duePaint = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'overdue':
      return tonePaint(theme, 'gold');
    case 'current':
      return tonePaint(theme, 'accent');
    case 'open':
      return tonePaint(theme, 'neutral');
    case 'done':
    case 'waiting':
    case 'off':
      return { color: 'text.secondary', backgroundColor: 'transparent', px: 0 };
  }
};

interface KkDueChipProps {
  state: KkStepState;
  text: string;
  label?: string;
  sx?: KkSx;
}

export const KkDueChip: FC<KkDueChipProps> = ({ state, text, label, sx }) => {
  const lead =
    state === 'overdue' || state === 'done' ? (
      <KkStateGlyph state={state} />
    ) : (
      <KkIcon name="clock" sx={{ width: CLOCK_EXTENT, height: CLOCK_EXTENT }} />
    );

  return (
    <Stack
      component="span"
      direction="row"
      aria-label={label}
      data-kk-due-chip={state}
      sx={[
        (theme) => ({
          ...stepFigures,
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 0.625,
          maxWidth: '100%',
          minWidth: 0,
          px: 0.875,
          py: 0.375,
          borderRadius: `${kkTokens.radius.pill}px`,
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.2,
          ...duePaint(theme, state),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {lead}
      <Box component="span" sx={{ minWidth: 0 }}>
        {text}
      </Box>
    </Stack>
  );
};
