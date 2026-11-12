import type { OriginRect } from '@furria/ui/reveal-geometry';
import { kkTokens } from '@furria/ui/tokens';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, MouseEvent } from 'react';
import { MASTHEAD_RESTING_OVER_PHOTO } from '../masthead-underlay';
import type { NavItem } from '../nav-items';

const activeChip = { color: 'primary.main', borderColor: 'primary.main' } as const;

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
      sx={(theme) => ({
        fontWeight: 700,
        color: 'text.primary',
        transition: theme.transitions.create(['color', 'border-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&.active': activeChip,
        [MASTHEAD_RESTING_OVER_PHOTO]: {
          color: kkTokens.overlay.onPhotoText,
          borderColor: alpha(kkTokens.overlay.onPhotoText, kkTokens.opacity.dimmed),
          '&.active': activeChip,
        },
      })}
    />
  );
};
