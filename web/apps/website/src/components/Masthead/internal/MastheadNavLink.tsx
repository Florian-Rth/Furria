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
      // TanStack Router marks the active link — red is the accent for the
      // current section, per the KK "accent/action only" rule.
      '&.active': { color: 'primary.main' },
    }}
  >
    {item.label}
  </Link>
);
