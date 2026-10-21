import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWash } from './internal/ink-wash';
import { stepFigures } from './KkStatePill/state-paint';
import { kkTokens } from './tokens';

export type KkTenureState = 'planned' | 'running' | 'past';

const MARK = '0.625rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const markPaint = (theme: Theme, state: KkTenureState): CSSObject => {
  switch (state) {
    case 'running':
      return { backgroundColor: palette(theme).text.primary };
    case 'planned':
      return {
        borderWidth: kkTokens.line.section,
        borderStyle: 'dotted',
        borderColor: palette(theme).text.primary,
      };
    case 'past':
      return {
        borderWidth: kkTokens.line.section,
        borderStyle: 'solid',
        borderColor: inkWash(theme, '45%'),
      };
  }
};

interface KkTenureChainRowProps {
  name: string;
  span: string;
  state: KkTenureState;
  stateLabel: string;
}

export const KkTenureChainRow: FC<KkTenureChainRowProps> = ({ name, span, state, stateLabel }) => (
  <Stack
    direction="row"
    component="li"
    data-kk-tenure-chain-row={state}
    sx={{
      alignItems: 'center',
      gap: 1.25,
      minWidth: 0,
      minHeight: '2.5rem',
      py: 0.5,
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
      '&:first-of-type': { borderTopWidth: 0 },
    }}
  >
    <Box
      component="span"
      role="img"
      aria-label={stateLabel}
      sx={[
        { width: MARK, height: MARK, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box' },
        (theme) => markPaint(theme, state),
      ]}
    />
    <Box
      component="span"
      sx={{
        flex: 1,
        minWidth: 0,
        typography: 'body2',
        fontWeight: state === 'running' ? 800 : 600,
        color: state === 'past' ? 'text.secondary' : 'text.primary',
        overflowWrap: 'anywhere',
      }}
    >
      {name}
    </Box>
    <Box
      component="span"
      sx={{
        ...stepFigures,
        flexShrink: 0,
        textAlign: 'right',
        typography: 'caption',
        fontWeight: 700,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      {span}
    </Box>
  </Stack>
);
