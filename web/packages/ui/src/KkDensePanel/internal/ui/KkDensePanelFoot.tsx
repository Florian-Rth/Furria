import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import {
  DENSE_INNER_RADIUS,
  DENSE_INSET,
  factColumnOf,
  factRulePaint,
  insetFocusRing,
} from '../dense-panel-paint';

const footPaint = (theme: Theme): CSSObject => ({
  justifyContent: 'flex-start',
  gap: 0.25,
  width: '100%',
  minHeight: kkTokens.tapTarget,
  pl: factColumnOf(theme),
  pr: DENSE_INSET,
  ...theme.typography.caption,
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.tight,
  color: 'text.primary',
  borderBottomLeftRadius: DENSE_INNER_RADIUS,
  borderBottomRightRadius: DENSE_INNER_RADIUS,
  ...factRulePaint(theme),
  '&.Mui-focusVisible': insetFocusRing(theme),
  '@media (hover: hover)': {
    '&:hover': redInk(theme),
  },
});

interface KkDensePanelFootProps {
  label: string;
  onClick: () => void;
}

export const KkDensePanelFoot: FC<KkDensePanelFootProps> = ({ label, onClick }) => (
  <ButtonBase disableRipple onClick={onClick} data-kk-dense-foot sx={footPaint}>
    {label}
    <KkIcon name="chevron" size="small" />
  </ButtonBase>
);
