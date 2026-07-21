import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { MastheadChipNav } from './internal/MastheadChipNav';
import { MastheadDesktopBar } from './internal/MastheadDesktopBar';
import { MastheadMobileBar } from './internal/MastheadMobileBar';
import { ThemeTransitionStyles } from './internal/ThemeTransitionStyles';

export const Masthead: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Stack component="header">
      <ThemeTransitionStyles />
      <MastheadDesktopBar />
      <MastheadMobileBar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <MastheadChipNav open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </Stack>
  );
};
