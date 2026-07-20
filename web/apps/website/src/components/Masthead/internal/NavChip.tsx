import Chip from '@mui/material/Chip';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { NavItem } from '../nav-items';

interface NavChipProps {
  item: NavItem;
  onNavigate: () => void;
}

export const NavChip: FC<NavChipProps> = ({ item, onNavigate }) => (
  <Chip
    component={RouterLink}
    to={item.to}
    label={item.label}
    variant="outlined"
    clickable
    onClick={onNavigate}
    sx={{
      fontWeight: 700,
      color: 'text.primary',
      '&.active': { color: 'primary.main', borderColor: 'primary.main' },
    }}
  />
);
