import { kkTokens } from '@furria/ui';
import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';

interface BackLinkProps {
  to: LinkProps['to'];
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export const BackLink: FC<BackLinkProps> = ({ to, children, sx }) => (
  <Link
    component={RouterLink}
    to={to}
    variant="body2"
    underline="none"
    data-kk-back-link
    sx={[
      {
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: kkTokens.tapTarget,
        color: 'primary.main',
        fontWeight: 800,
        '&:focus-visible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: 'currentColor',
          outlineOffset: 2,
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Link>
);
