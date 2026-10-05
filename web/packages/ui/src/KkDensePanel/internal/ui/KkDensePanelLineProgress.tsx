import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { DENSE_INSET } from '../dense-panel-paint';

const { light, dark } = kkTokens.color;

const trackPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  zIndex: 1,
  left: theme.spacing(DENSE_INSET),
  right: theme.spacing(DENSE_INSET),
  bottom: -kkTokens.line.hair,
  height: kkTokens.line.section,
  pointerEvents: 'none',
  ...applyScheme(theme, schemeFill(light.line2, dark.line2)),
});

const fillPaint = (theme: Theme): CSSObject => ({
  display: 'block',
  height: '100%',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...redInk(theme),
  backgroundColor: 'currentColor',
});

interface KkDensePanelLineProgressProps {
  width: string;
}

export const KkDensePanelLineProgress: FC<KkDensePanelLineProgressProps> = ({ width }) => (
  <Box component="span" aria-hidden data-kk-dense-progress sx={trackPaint}>
    <Box component="span" sx={[fillPaint, { width }]} />
  </Box>
);
