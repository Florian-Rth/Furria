import Divider from '@mui/material/Divider';
import type { FC } from 'react';
import { kkTokens } from './tokens';

type KkRuleWeight = keyof typeof kkTokens.line;

interface KkRuleProps {
  weight?: KkRuleWeight;
}

export const KkRule: FC<KkRuleProps> = ({ weight = 'page' }) => (
  <Divider
    data-kk-rule
    sx={{
      borderBottomWidth: kkTokens.line[weight],
      borderColor: weight === 'hair' ? 'divider' : 'text.primary',
      opacity: 1,
    }}
  />
);
