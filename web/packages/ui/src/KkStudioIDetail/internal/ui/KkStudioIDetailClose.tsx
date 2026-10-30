import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioIDetailCloseProps {
  label: string;
  onClose: () => void;
}

export const KkStudioIDetailClose: FC<KkStudioIDetailCloseProps> = ({ label, onClose }) => (
  <ButtonBase
    aria-label={label}
    onClick={onClose}
    data-kk-studio-i-detail-close
    sx={(theme) => ({
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      mr: -0.75,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: (theme.vars ?? theme).palette.text.secondary,
      ...focusRing(theme),
    })}
  >
    <CloseRoundedIcon fontSize="small" />
  </ButtonBase>
);
