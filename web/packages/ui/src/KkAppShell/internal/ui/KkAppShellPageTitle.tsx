import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type KkAppShellTextTransform = 'uppercase' | 'none';

interface KkAppShellPageTitleProps extends PropsWithChildren {
  transform?: KkAppShellTextTransform;
}

export const KkAppShellPageTitle: FC<KkAppShellPageTitleProps> = ({
  transform = 'uppercase',
  children,
}) => (
  <Typography
    component="h1"
    data-kk-app-shell-page-title
    sx={{
      fontFamily: kkTokens.font.display,
      fontSize: { xs: '1.75rem', desktop: '2.25rem' },
      lineHeight: 1.15,
      letterSpacing: '0.02em',
      color: 'text.primary',
      textTransform: transform,
    }}
  >
    {children}
  </Typography>
);
