import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const CAPTION: CSSObject = {
  display: 'block',
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: 'text.secondary',
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
};

interface CountCaptionProps {
  children: string;
}

export const CountCaption: FC<CountCaptionProps> = ({ children }) => (
  <Typography component="span" variant="caption" sx={CAPTION}>
    {children}
  </Typography>
);
