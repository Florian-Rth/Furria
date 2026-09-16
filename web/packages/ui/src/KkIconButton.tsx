import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';

type KkIconButtonSize = 'small' | 'medium';

interface KkIconButtonProps {
  label: string;
  icon: KkIconName;
  size?: KkIconButtonSize;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkIconButton: FC<KkIconButtonProps> = ({
  label,
  icon,
  size = 'medium',
  type = 'button',
  disabled,
  onClick,
  sx,
}) => (
  <IconButton
    aria-label={label}
    type={type}
    size={size}
    disabled={disabled}
    onClick={onClick}
    data-kk-icon-button
    sx={[
      (theme) => ({ color: 'text.primary', ...focusRing(theme) }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkIcon name={icon} size={size} />
  </IconButton>
);
