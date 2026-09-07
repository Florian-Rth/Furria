import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { ElementType, FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

interface KkAppShellNavItemProps {
  label: string;
  icon: KkIconName;
  active?: boolean;
  component?: ElementType;
  to?: string;
  onClick?: () => void;
}

export const KkAppShellNavItem: FC<KkAppShellNavItemProps> = ({
  label,
  icon,
  active,
  component,
  to,
  onClick,
}) => {
  const linkProps = to === undefined ? {} : { to };
  const componentProps = component === undefined ? {} : { component };

  return (
    <ListItemButton
      selected={active}
      {...componentProps}
      {...linkProps}
      onClick={onClick}
      data-kk-app-shell-nav-item
      sx={{
        gap: 1.5,
        px: 1.5,
        py: 1,
        minHeight: 'auto',
        color: 'text.primary',
        '&.Mui-selected, &.active': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
        <KkIcon name={icon} size="small" />
      </ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { variant: 'subtitle2' } }} />
    </ListItemButton>
  );
};
