import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { responsiveTypography } from '../../../internal/responsive-typography';

const TITLE_TYPOGRAPHY = { xs: 'display', desktop: 'poster' } as const;

export const KkHeroTitle: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    variant="poster"
    component="h1"
    sx={(theme) => responsiveTypography(theme, TITLE_TYPOGRAPHY, { textTransform: 'uppercase' })}
  >
    {children}
  </Typography>
);
