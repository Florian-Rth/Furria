import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkPracticeStepsCloseProps {
  label: string;
  onClose: () => void;
}

export const KkPracticeStepsClose: FC<KkPracticeStepsCloseProps> = ({ label, onClose }) => (
  <ButtonBase
    aria-label={label}
    onClick={onClose}
    data-kk-practice-steps-close
    sx={(theme) => ({
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: (theme.vars ?? theme).palette.text.secondary,
      ...focusRing(theme),
    })}
  >
    <CloseRoundedIcon />
  </ButtonBase>
);
