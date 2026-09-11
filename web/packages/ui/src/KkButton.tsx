import Button from '@mui/material/Button';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkButtonVariant = 'contained' | 'outlined' | 'text';
type KkButtonTone = 'default' | 'danger';
type KkButtonSize = 'small' | 'medium' | 'large';

const DANGER_BORDER_MIX = '35%';
const SMALL_FONT_SIZE = '0.75rem';

const dangerBorderColor = (theme: Theme): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.error.main} ${DANGER_BORDER_MIX}, transparent)`;

const hitArea: CSSObject = {
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: kkTokens.tapTarget,
    transform: 'translateY(-50%)',
  },
};

const sizeStyles: Record<KkButtonSize, CSSObject> = {
  small: { minHeight: 0, px: 1.5, py: 0.625, fontSize: SMALL_FONT_SIZE, ...hitArea },
  medium: { minHeight: kkTokens.tapTarget, px: 2.5 },
  large: { minHeight: kkTokens.tapTarget, px: 3 },
};

const toneVariantStyles: Record<
  KkButtonTone,
  Record<KkButtonVariant, (theme: Theme) => CSSObject>
> = {
  default: {
    contained: () => ({ color: 'primary.contrastText' }),
    outlined: () => ({
      color: 'text.primary',
      borderColor: 'divider',
      borderWidth: kkTokens.line.hair,
    }),
    text: () => ({ color: 'primary.main' }),
  },
  danger: {
    contained: () => ({ color: 'error.contrastText' }),
    outlined: (theme) => ({
      color: 'error.main',
      borderColor: dangerBorderColor(theme),
      borderWidth: kkTokens.line.hair,
    }),
    text: () => ({ color: 'error.main' }),
  },
};

const toneColors: Record<KkButtonTone, 'primary' | 'error'> = {
  default: 'primary',
  danger: 'error',
};

interface KkButtonProps extends PropsWithChildren {
  variant?: KkButtonVariant;
  tone?: KkButtonTone;
  type?: 'button' | 'submit';
  size?: KkButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  onClick?: () => void;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  href?: string;
  sx?: KkSx;
}

export const KkButton: FC<KkButtonProps> = ({
  variant = 'contained',
  tone = 'default',
  type = 'button',
  size = 'medium',
  fullWidth,
  disabled,
  loading,
  startIcon,
  onClick,
  component,
  to,
  params,
  href,
  sx,
  children,
}) => {
  const ariaDisabled = disabled === true ? true : undefined;
  const componentProps = component === undefined ? {} : { component };
  const routeProps = component === undefined ? {} : { to, params };
  const variantStyle = toneVariantStyles[tone][variant];

  return (
    <Button
      variant={variant}
      color={toneColors[tone]}
      type={type}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      aria-disabled={ariaDisabled}
      loading={loading}
      startIcon={startIcon}
      onClick={onClick}
      {...componentProps}
      {...routeProps}
      href={href}
      data-kk-button
      sx={[
        (theme) => ({
          ...sizeStyles[size],
          ...variantStyle(theme),
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Button>
  );
};
