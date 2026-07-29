import { kkTokens } from '@furria/ui';
import AppBar from '@mui/material/AppBar';
import { alpha } from '@mui/material/styles';
import type { FC } from 'react';
import { useState } from 'react';
import { MastheadChipNav } from './internal/MastheadChipNav';
import { MastheadDesktopBar } from './internal/MastheadDesktopBar';
import { MastheadMobileBar } from './internal/MastheadMobileBar';
import { MastheadNavBurst } from './internal/MastheadNavBurst';
import type { OriginRect } from './internal/reveal-geometry';
import { ThemeTransitionStyles } from './internal/ThemeTransitionStyles';
import { useNavBurst } from './internal/use-nav-burst';
import { usePublishMastheadHeight } from './internal/use-publish-masthead-height';
import { useScrolledPastTop } from './internal/use-scrolled-past-top';

export const Masthead: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPastTop();
  const mastheadRef = usePublishMastheadHeight<HTMLElement>();
  const { navBurst, fireNavBurst } = useNavBurst(mastheadRef);

  const handleNavigate = (chip: OriginRect): void => {
    setMenuOpen(false);
    fireNavBurst(chip);
  };

  return (
    <AppBar
      ref={mastheadRef}
      data-kk-masthead-scrolled={scrolled}
      position="sticky"
      elevation={0}
      sx={(theme) => {
        const glassBackground = (bg: string): string =>
          scrolled ? alpha(bg, kkTokens.glass.tintOpacity) : 'transparent';

        return {
          backgroundColor: glassBackground(kkTokens.color.light.bg),
          backdropFilter: scrolled ? `blur(${kkTokens.glass.blur})` : 'none',
          WebkitBackdropFilter: scrolled ? `blur(${kkTokens.glass.blur})` : 'none',
          transition: theme.transitions.create(['background-color', 'backdrop-filter'], {
            duration: theme.transitions.duration.short,
          }),
          ...theme.applyStyles('dark', {
            backgroundColor: glassBackground(kkTokens.color.dark.bg),
          }),
        };
      }}
    >
      <ThemeTransitionStyles />
      <MastheadDesktopBar />
      <MastheadMobileBar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <MastheadChipNav open={menuOpen} onNavigate={handleNavigate} />
      {navBurst ? <MastheadNavBurst burst={navBurst} /> : null}
    </AppBar>
  );
};
