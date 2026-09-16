import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { lineClamp } from './internal/line-clamp';
import type { KkSx } from './kk-sx';

type KkTextVariant = 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption';
type KkTextTone = 'primary' | 'secondary' | 'disabled';

interface KkTextProps extends PropsWithChildren {
  variant?: KkTextVariant;
  tone?: KkTextTone;
  clamp?: number;
  component?: ElementType;
  sx?: KkSx;
}

const toneStyles: Record<KkTextTone, { color: string }> = {
  primary: { color: 'text.primary' },
  secondary: { color: 'text.secondary' },
  disabled: { color: 'text.disabled' },
};

export const KkText: FC<KkTextProps> = ({
  variant = 'body1',
  tone = 'primary',
  clamp,
  component,
  sx,
  children,
}) => {
  const componentProps = component === undefined ? {} : { component };
  const clampStyles = clamp === undefined ? {} : lineClamp(clamp);

  return (
    <Typography
      variant={variant}
      {...componentProps}
      data-kk-text
      sx={[
        { ...toneStyles[tone], textWrap: 'pretty', ...clampStyles },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
};
