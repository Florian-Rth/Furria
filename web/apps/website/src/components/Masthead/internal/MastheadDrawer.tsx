import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { navItems } from '../nav-items';
import { CloseIcon } from './CloseIcon';
import { ThemeModeToggle } from './ThemeModeToggle';

interface MastheadDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Mobile nav drawer — same nav data as the desktop bar, plus the theme toggle.
export const MastheadDrawer: FC<MastheadDrawerProps> = ({ open, onClose }) => (
  <Drawer anchor="left" open={open} onClose={onClose}>
    <Stack sx={{ width: (theme) => theme.spacing(34), maxWidth: '80vw', flex: 1, py: 1 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', pl: 2.5, pr: 1.5, py: 1 }}
      >
        <Typography
          variant="h5"
          component="span"
          sx={{ color: 'text.primary', letterSpacing: '0.06em' }}
        >
          FURRIA
        </Typography>
        <IconButton aria-label="Menü schließen" onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />
      <List component="nav" aria-label="Hauptnavigation" sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton key={item.to} component={RouterLink} to={item.to} onClick={onClose}>
            <ListItemText
              slotProps={{ primary: { sx: { fontWeight: 700 } } }}
              sx={{ '.active &': { color: 'primary.main' } }}
              primary={item.label}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', pl: 2.5, pr: 1.5, py: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Darstellung
        </Typography>
        <ThemeModeToggle />
      </Stack>
    </Stack>
  </Drawer>
);
