import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const morePaint = (theme: Theme): CSSObject => ({
  alignSelf: 'flex-start',
  minHeight: kkTokens.tapTarget,
  gap: 0.5,
  px: 1.25,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: 'text.secondary',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': redInk(theme) },
});

interface KkAgendaMoreProps {
  label: string;
  onSelect: () => void;
}

export const KkAgendaMore: FC<KkAgendaMoreProps> = ({ label, onSelect }) => (
  <ButtonBase disableRipple onClick={onSelect} data-kk-agenda-more sx={morePaint}>
    <KkIcon name="add" size="small" />
    <Typography component="span" variant="body2" sx={{ fontWeight: 800 }}>
      {label}
    </Typography>
  </ButtonBase>
);
