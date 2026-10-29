import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioEStepsTriggerProps extends PropsWithChildren {
  label: string;
  expanded: boolean;
  onOpen: () => void;
}

export const KkStudioEStepsTrigger: FC<KkStudioEStepsTriggerProps> = ({
  label,
  expanded,
  onOpen,
  children,
}) => (
  <ButtonBase
    aria-label={label}
    aria-expanded={expanded}
    aria-haspopup="dialog"
    onClick={onOpen}
    data-kk-studio-e-steps-trigger
    sx={(theme) => ({
      flex: 1,
      minWidth: 0,
      justifyContent: 'flex-start',
      gap: 1,
      textAlign: 'left',
      borderRadius: `${kkTokens.radius.base}px`,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.985)' },
      ...focusRing(theme),
    })}
  >
    <FormatListBulletedRoundedIcon
      sx={(theme) => ({
        flexShrink: 0,
        p: 0.75,
        boxSizing: 'content-box',
        borderRadius: `${kkTokens.radius.pill}px`,
        color: (theme.vars ?? theme).palette.text.primary,
        backgroundColor: (theme.vars ?? theme).palette.action.hover,
      })}
    />
    {children}
  </ButtonBase>
);
