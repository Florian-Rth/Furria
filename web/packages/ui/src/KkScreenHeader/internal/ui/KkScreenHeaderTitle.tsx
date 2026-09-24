import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type KkScreenHeaderTitleTransform = 'uppercase' | 'none';

interface KkScreenHeaderTitleProps extends PropsWithChildren {
  transform?: KkScreenHeaderTitleTransform;
}

export const KkScreenHeaderTitle: FC<KkScreenHeaderTitleProps> = ({
  transform = 'uppercase',
  children,
}) => (
  <Typography
    component="h1"
    data-kk-screen-header-title
    sx={{
      typography: 'h1',
      lineHeight: 1.1,
      letterSpacing: kkTokens.type.tracking.display,
      color: 'text.primary',
      textTransform: transform,
      textWrap: 'balance',
    }}
  >
    {children}
  </Typography>
);
