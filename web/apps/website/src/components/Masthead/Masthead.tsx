import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { MastheadDesktopBar } from './internal/MastheadDesktopBar';
import { MastheadDrawer } from './internal/MastheadDrawer';
import { MastheadMobileBar } from './internal/MastheadMobileBar';

// The site chrome header: newspaper masthead on desktop, hamburger bar +
// drawer on mobile. Both render the same nav data (see nav-items.ts).
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
