import { kkTokens } from '@furria/ui';
import Link from '@mui/material/Link';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';

interface SectionActionLinkProps {
  to: LinkProps['to'] | string;
  children: ReactNode;
}

export const SectionActionLink: FC<SectionActionLinkProps> = ({ to, children }) => (
  <Link
    component={RouterLink}
    to={to}
    underline="hover"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: kkTokens.tapTarget,
      color: 'primary.main',
      fontWeight: 800,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {children}
  </Link>
);
