import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';

type KkTextVariant = 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption';
type KkTextTone = 'primary' | 'secondary' | 'disabled';

interface KkTextProps extends PropsWithChildren {
  variant?: KkTextVariant;
  tone?: KkTextTone;
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
  component,
  sx,
  children,
}) => {
  const componentProps = component === undefined ? {} : { component };

  return (
    <Typography
      variant={variant}
      {...componentProps}
      data-kk-text
      sx={[{ ...toneStyles[tone], textWrap: 'pretty' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Typography>
  );
};
