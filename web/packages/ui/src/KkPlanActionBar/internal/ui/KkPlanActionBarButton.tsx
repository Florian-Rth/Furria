import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { planButtonPaint } from '../../../internal/plan-surface';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

export type KkPlanActionTone = 'ink' | 'danger';

interface KkPlanActionBarButtonProps {
  id: string;
  label: string;
  icon: KkIconName;
  tone?: KkPlanActionTone;
  disabled?: boolean;
  narrowHidden?: boolean;
  onClick: () => void;
}

const NARROW_MAX_WIDTH_PX = 480;

export const KkPlanActionBarButton: FC<KkPlanActionBarButtonProps> = ({
  id,
  label,
  icon,
  tone = 'ink',
  disabled = false,
  narrowHidden = false,
  onClick,
}) => (
  <ButtonBase
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    data-kk-plan-action={id}
    sx={(theme) => ({
      ...planButtonPaint(theme, false),
      width: '2.75rem',
      height: '2.75rem',
      ...(tone === 'danger' ? { color: 'error.main' } : {}),
      ...(narrowHidden
        ? { [theme.breakpoints.down(NARROW_MAX_WIDTH_PX)]: { display: 'none' } }
        : {}),
    })}
  >
    <KkIcon name={icon} size="small" />
  </ButtonBase>
);
