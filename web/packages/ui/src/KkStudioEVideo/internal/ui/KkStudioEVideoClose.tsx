import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const closePaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: (theme.vars ?? theme).palette.text.primary,
  ...focusRing(theme),
});

interface KkStudioEVideoCloseProps {
  label: string;
  onClose: () => void;
}

export const KkStudioEVideoClose: FC<KkStudioEVideoCloseProps> = ({ label, onClose }) => (
  <ButtonBase aria-label={label} onClick={onClose} sx={closePaint}>
    <CloseRoundedIcon />
  </ButtonBase>
);
