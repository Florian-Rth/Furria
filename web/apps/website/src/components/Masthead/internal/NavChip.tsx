import Chip from '@mui/material/Chip';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, MouseEvent } from 'react';
import type { NavItem } from '../nav-items';
import type { OriginRect } from './reveal-geometry';

interface NavChipProps {
  item: NavItem;
  onNavigate: (chip: OriginRect) => void;
}

export const NavChip: FC<NavChipProps> = ({ item, onNavigate }) => {
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    onNavigate(event.currentTarget.getBoundingClientRect());
  };

  return (
    <Chip
      component={RouterLink}
      to={item.to}
      label={item.label}
      variant="outlined"
      clickable
      onClick={handleClick}
      sx={{
        fontWeight: 700,
        color: 'text.primary',
        '&.active': { color: 'primary.main', borderColor: 'primary.main' },
      }}
    />
  );
};
