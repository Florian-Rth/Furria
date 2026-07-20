import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { MastheadDesktopBar } from './internal/MastheadDesktopBar';
import { MastheadDrawer } from './internal/MastheadDrawer';
import { MastheadMobileBar } from './internal/MastheadMobileBar';

export const Masthead: FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Stack component="header">
      <MastheadDesktopBar />
      <MastheadMobileBar onMenuOpen={() => setDrawerOpen(true)} />
      <MastheadDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Stack>
  );
};
