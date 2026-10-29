import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const MASTHEAD = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: 1,
  rowGap: 0.25,
  minWidth: 0,
  pb: 1,
  borderBottomWidth: kkTokens.line.section,
  borderBottomStyle: 'solid',
  borderBottomColor: 'text.primary',
} as const;

const FACT = {
  typography: 'caption',
  fontWeight: 700,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  '&:not(:first-of-type)::before': { content: '"·"', mr: 1, color: 'text.disabled' },
} as const;

const ownPaint = (theme: Theme): CSSObject => ({
  ...redInk(theme),
  typography: 'caption',
  fontWeight: 900,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  ml: 'auto',
});

interface KkStudioBManualMastheadProps {
  facts: readonly string[];
  own: string | null;
}

export const KkStudioBManualMasthead: FC<KkStudioBManualMastheadProps> = ({ facts, own }) => {
  const lines = facts.map((fact) => (
    <Box key={fact} component="span" sx={FACT}>
      {fact}
    </Box>
  ));
  const ownLine =
    own === null ? null : (
      <Box component="strong" sx={ownPaint}>
        {own}
      </Box>
    );

  return (
    <Box data-kk-studio-b-masthead sx={MASTHEAD}>
      {lines}
      {ownLine}
    </Box>
  );
};
