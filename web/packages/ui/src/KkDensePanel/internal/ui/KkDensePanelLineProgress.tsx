import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { DENSE_INSET, factColumnOf } from '../dense-panel-paint';

const trackPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  left: factColumnOf(theme),
  right: theme.spacing(DENSE_INSET),
  bottom: 0,
  height: kkTokens.line.hair,
  pointerEvents: 'none',
});

const FILL_PAINT: CSSObject = {
  display: 'block',
  height: '100%',
  borderRadius: `${kkTokens.radius.bar}px`,
  backgroundColor: 'text.disabled',
};

interface KkDensePanelLineProgressProps {
  width: string;
}

export const KkDensePanelLineProgress: FC<KkDensePanelLineProgressProps> = ({ width }) => (
  <Box component="span" aria-hidden data-kk-dense-progress sx={trackPaint}>
    <Box component="span" sx={{ ...FILL_PAINT, width }} />
  </Box>
);
