import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';

type KkHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type KkHeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface KkHeadingProps extends PropsWithChildren {
  level: KkHeadingLevel;
  component?: ElementType;
  sx?: KkSx;
}

const levelVariants: Record<KkHeadingLevel, KkHeadingVariant> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

export const KkHeading: FC<KkHeadingProps> = ({ level, component, sx, children }) => {
  const variant = levelVariants[level];
  const componentProps = component === undefined ? {} : { component };

  return (
    <Typography
      variant={variant}
      {...componentProps}
      data-kk-heading
      sx={[{ textWrap: 'balance' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Typography>
  );
};
