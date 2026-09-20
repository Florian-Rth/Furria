import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { lineClamp } from './internal/line-clamp';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkTextVariant = 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption';
type KkTextTone = 'primary' | 'secondary' | 'disabled';
type KkTextMeasure = 'lead' | 'note' | 'text';

interface KkTextProps extends PropsWithChildren {
  variant?: KkTextVariant;
  tone?: KkTextTone;
  measure?: KkTextMeasure;
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
  measure,
  clamp,
  component,
  sx,
  children,
}) => {
  const componentProps = component === undefined ? {} : { component };
  const clampStyles = clamp === undefined ? {} : lineClamp(clamp);
  const measureStyles = measure === undefined ? {} : { maxWidth: kkTokens.measure[measure] };

  return (
    <Typography
      variant={variant}
      {...componentProps}
      data-kk-text
      sx={[
        { ...toneStyles[tone], textWrap: 'pretty', ...measureStyles, ...clampStyles },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
};
