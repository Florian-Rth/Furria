import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { proofMarginRuleOf } from '../../../internal/proof-margin-rule';

export type KkProofMarkKind = 'missing' | 'changed';

interface KkProofSheetPartProps extends PropsWithChildren {
  mark: KkProofMarkKind | null;
}

const ruleColorOf = (theme: Theme, mark: KkProofMarkKind | null): string => {
  const palette = (theme.vars ?? theme).palette;
  if (mark === 'missing') {
    return palette.error.main;
  }
  return mark === 'changed' ? palette.primary.main : 'transparent';
};

export const KkProofSheetPart: FC<KkProofSheetPartProps> = ({ mark, children }) => (
  <Box
    data-kk-proof-part={mark ?? 'clean'}
    sx={(theme: Theme) => ({
      position: 'relative',
      minWidth: 0,
      '&::before': proofMarginRuleOf(theme, ruleColorOf(theme, mark)),
    })}
  >
    {children}
  </Box>
);
