import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { planButtonPaint } from '../../../internal/plan-surface';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

interface KkPlanDockButtonProps {
  id: string;
  label: string;
  icon: KkIconName;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const KkPlanDockButton: FC<KkPlanDockButtonProps> = ({
  id,
  label,
  icon,
  pressed = false,
  disabled = false,
  onClick,
}) => (
  <ButtonBase
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onClick}
    data-kk-plan-dock-button={id}
    sx={(theme) => ({
      ...planButtonPaint(theme, pressed),
      flex: '1 0 auto',
      flexDirection: 'column',
      gap: 0.25,
      minWidth: '3.75rem',
      minHeight: '3.25rem',
      px: 1,
      py: 0.5,
    })}
  >
    <KkIcon name={icon} size="small" />
    <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  </ButtonBase>
);
