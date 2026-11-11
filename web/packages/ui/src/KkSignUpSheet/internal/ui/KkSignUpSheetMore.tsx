import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkSignUpSheetMoreProps {
  label: string;
  onClick: () => void;
  sx?: KkSx;
}

const morePaint = (theme: Theme): CSSObject => ({
  ...focusRing(theme),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1),
  width: '100%',
  minHeight: theme.spacing(5.5),
  padding: theme.spacing(0, 1.5),
  borderRadius: `${kkTokens.radius.bar * 3}px`,
  boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
  color: (theme.vars ?? theme).palette.text.primary,
  '&:hover': {
    backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} 6%, transparent)`,
  },
});

export const KkSignUpSheetMore: FC<KkSignUpSheetMoreProps> = ({ label, onClick, sx }) => (
  <ButtonBase
    onClick={onClick}
    data-kk-sign-up-sheet-more
    sx={[morePaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <KkIcon name="chevron" size="small" />
  </ButtonBase>
);
