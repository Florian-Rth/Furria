import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const RULE_WIDTH_SPACING = 16;

export const KkBrandStageRule: FC = () => (
  <Box
    aria-hidden
    data-kk-brand-stage-rule
    sx={(theme) => ({
      width: theme.spacing(RULE_WIDTH_SPACING),
      height: kkTokens.line.page,
      bgcolor: 'primary.main',
    })}
  />
);
