import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { navItems } from '../nav-items';
import { ChipNavScroller } from './ChipNavScroller';
import { NavChip } from './NavChip';
import type { OriginRect } from './reveal-geometry';
import { TicketsChip } from './TicketsChip';

export const MASTHEAD_CHIP_NAV_ID = 'masthead-chip-nav';

const collapseDurationMs = 250;
const fadeOutDurationMs = 120;

const collapsedState = { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-10px)' } as const;
const expandedState = { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' } as const;

const openAnimation = `masthead-chip-nav-in ${collapseDurationMs}ms ease-out forwards`;
const closeAnimation = `masthead-chip-nav-out ${fadeOutDurationMs}ms ease-in forwards`;

interface MastheadChipNavProps {
  open: boolean;
  onNavigate: (chip: OriginRect) => void;
}

export const MastheadChipNav: FC<MastheadChipNavProps> = ({ open, onNavigate }) => (
  <Collapse
    in={open}
    timeout={collapseDurationMs}
    unmountOnExit
    sx={{ display: { desktop: 'none' } }}
  >
    <Stack
      id={MASTHEAD_CHIP_NAV_ID}
      component="nav"
      aria-label="Hauptnavigation"
      sx={{
        '@keyframes masthead-chip-nav-in': { from: collapsedState, to: expandedState },
        '@keyframes masthead-chip-nav-out': { from: expandedState, to: collapsedState },
        '@media (prefers-reduced-motion: no-preference)': {
          animation: open ? openAnimation : closeAnimation,
        },
      }}
    >
      <ChipNavScroller>
        <TicketsChip onNavigate={onNavigate} />
        {navItems.map((item) => (
          <NavChip key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </ChipNavScroller>
    </Stack>
  </Collapse>
);
