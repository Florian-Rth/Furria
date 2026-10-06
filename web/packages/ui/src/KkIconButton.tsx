import IconButton from '@mui/material/IconButton';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';

type KkIconButtonSize = 'small' | 'medium';

const toggleInk = (pressed: boolean | undefined): string =>
  pressed === false ? 'text.secondary' : 'text.primary';

interface KkIconButtonProps {
  label: string;
  icon: KkIconName;
  size?: KkIconButtonSize;
  type?: 'button' | 'submit';
  disabled?: boolean;
  pressed?: boolean;
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
  pressed,
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
      aria-pressed={pressed}
      type={type}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...routeProps}
      data-kk-icon-button
      sx={[
        (theme) => ({ color: toggleInk(pressed), ...focusRing(theme) }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} size={size} />
    </IconButton>
  );
};
