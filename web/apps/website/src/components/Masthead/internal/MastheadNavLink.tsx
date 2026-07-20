import Link from '@mui/material/Link';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { NavItem } from '../nav-items';

export const MastheadNavLink: FC<{ item: NavItem }> = ({ item }) => (
  <Link
    component={RouterLink}
    to={item.to}
    underline="hover"
    variant="body2"
    sx={{
      color: 'text.primary',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      '&.active': { color: 'primary.main' },
    }}
  >
    {item.label}
  </Link>
);
