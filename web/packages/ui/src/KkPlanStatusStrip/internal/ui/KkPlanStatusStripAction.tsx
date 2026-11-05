import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { planButtonPaint } from '../../../internal/plan-surface';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

interface KkPlanStatusStripActionProps {
  id: string;
  label: string;
  icon: KkIconName;
  disabled?: boolean;
  onClick: () => void;
}

export const KkPlanStatusStripAction: FC<KkPlanStatusStripActionProps> = ({
  id,
  label,
  icon,
  disabled = false,
  onClick,
}) => (
  <ButtonBase
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    data-kk-plan-status-action={id}
    sx={(theme) => ({ ...planButtonPaint(theme, false), width: '2.5rem', height: '2.5rem' })}
  >
    <KkIcon name={icon} size="small" />
  </ButtonBase>
);
