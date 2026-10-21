import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type KkScreenHeaderTitleTransform = 'uppercase' | 'none';
export type KkScreenHeaderTitleSize = 'page' | 'compact';

const TITLE_TYPOGRAPHY: Record<KkScreenHeaderTitleSize, 'h1' | 'h3'> = {
  page: 'h1',
  compact: 'h3',
};

interface KkScreenHeaderTitleProps extends PropsWithChildren {
  transform?: KkScreenHeaderTitleTransform;
  size?: KkScreenHeaderTitleSize;
}

export const KkScreenHeaderTitle: FC<KkScreenHeaderTitleProps> = ({
  transform = 'uppercase',
  size = 'page',
  children,
}) => (
  <Typography
    component="h1"
    data-kk-screen-header-title
    sx={{
      typography: TITLE_TYPOGRAPHY[size],
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
