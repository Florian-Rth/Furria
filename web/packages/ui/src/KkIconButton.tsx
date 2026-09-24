import IconButton from '@mui/material/IconButton';
import type { ElementType, FC } from 'react';
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
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  sx?: KkSx;
}

export const KkIconButton: FC<KkIconButtonProps> = ({
  label,
  icon,
  size = 'medium',
  type = 'button',
  disabled,
  onClick,
  component,
  to,
  params,
  sx,
}) => {
  const routeProps = component === undefined ? {} : { component, to, params };

  return (
    <IconButton
      aria-label={label}
      type={type}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...routeProps}
      data-kk-icon-button
      sx={[
        (theme) => ({ color: 'text.primary', ...focusRing(theme) }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} size={size} />
    </IconButton>
  );
};
