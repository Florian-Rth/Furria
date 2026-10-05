import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const ASIDE_PAINT: CSSObject = {
  color: 'text.secondary',
  fontWeight: 700,
  letterSpacing: kkTokens.type.tracking.tight,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  textAlign: 'right',
};

interface KkDensePanelAsideProps {
  text: string;
}

export const KkDensePanelAside: FC<KkDensePanelAsideProps> = ({ text }) => (
  <Typography component="span" variant="caption" aria-hidden data-kk-dense-aside sx={ASIDE_PAINT}>
    {text}
  </Typography>
);
