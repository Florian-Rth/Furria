import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkStudioNudgeDirection = 'earlier' | 'later';

const GLYPHS: Record<KkStudioNudgeDirection, ReactNode> = {
  earlier: <RemoveRoundedIcon fontSize="small" />,
  later: <AddRoundedIcon fontSize="small" />,
};

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioPlacementNudgeProps {
  direction: KkStudioNudgeDirection;
  label: string;
  disabled: boolean;
  onNudge: () => void;
}

export const KkStudioPlacementNudge: FC<KkStudioPlacementNudgeProps> = ({
  direction,
  label,
  disabled,
  onNudge,
}) => (
  <ButtonBase
    aria-label={label}
    disabled={disabled}
    onClick={onNudge}
    data-kk-studio-nudge={direction}
    sx={(theme) => ({
      flexShrink: 0,
      width: '2.25rem',
      height: '2.25rem',
      borderRadius: `${kkTokens.radius.pill}px`,
      color: palette(theme).text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.9)' },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      ...focusRing(theme),
    })}
  >
    {GLYPHS[direction]}
  </ButtonBase>
);
