import Button from '@mui/material/Button';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkButtonVariant = 'contained' | 'outlined' | 'text';
type KkButtonTone = 'default' | 'danger';

const DANGER_BORDER_MIX = '35%';

const dangerBorderColor = (theme: Theme): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.error.main} ${DANGER_BORDER_MIX}, transparent)`;

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
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  onClick?: () => void;
  component?: ElementType;
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
  href,
  sx,
  children,
}) => {
  const ariaDisabled = disabled === true ? true : undefined;
  const componentProps = component === undefined ? {} : { component };
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
      href={href}
      data-kk-button
      sx={[
        (theme) => ({ minHeight: kkTokens.tapTarget, px: 2.5, ...variantStyle(theme) }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Button>
  );
};
