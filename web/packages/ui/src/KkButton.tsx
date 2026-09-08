import Button from '@mui/material/Button';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkButtonVariant = 'contained' | 'outlined' | 'text';

interface KkButtonProps extends PropsWithChildren {
  variant?: KkButtonVariant;
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

interface KkButtonVariantStyle {
  color: string;
  borderColor?: string;
  borderWidth?: number;
}

const variantStyles: Record<KkButtonVariant, KkButtonVariantStyle> = {
  contained: { color: 'primary.contrastText' },
  outlined: {
    color: 'text.primary',
    borderColor: 'divider',
    borderWidth: kkTokens.line.hair,
  },
  text: { color: 'primary.main' },
};

export const KkButton: FC<KkButtonProps> = ({
  variant = 'contained',
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

  return (
    <Button
      variant={variant}
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
        { minHeight: kkTokens.tapTarget, px: 2.5, ...variantStyles[variant] },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Button>
  );
};
