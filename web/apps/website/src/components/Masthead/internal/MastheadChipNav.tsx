import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { navItems } from '../nav-items';
import { ChipNavScroller } from './ChipNavScroller';
import { NavChip } from './NavChip';
import { TicketsChip } from './TicketsChip';

export const MASTHEAD_CHIP_NAV_ID = 'masthead-chip-nav';

const appearDurationMs = 250;

interface MastheadChipNavProps {
  open: boolean;
  onNavigate: () => void;
}

export const MastheadChipNav: FC<MastheadChipNavProps> = ({ open, onNavigate }) => (
  <Collapse in={open} timeout={appearDurationMs} unmountOnExit sx={{ display: { md: 'none' } }}>
    <Stack
      id={MASTHEAD_CHIP_NAV_ID}
      component="nav"
      aria-label="Hauptnavigation"
      sx={{
        '@keyframes masthead-chip-nav-in': {
          from: { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-10px)' },
          to: { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: no-preference)': {
          animation: `masthead-chip-nav-in ${appearDurationMs}ms ease-out`,
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
