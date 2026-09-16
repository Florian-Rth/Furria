import Stack from '@mui/material/Stack';
import { AnimatePresence, motion } from 'motion/react';
import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import { NAV_AT_REST, NAV_SUNKEN, navGlide } from '../logic/nav-motion';
import { useKkShell } from '../logic/shell-context';
import { KkShellNavItem } from './KkShellNavItem';

const { navHeight } = kkTokens.shell;
const NAV_LABEL = 'Bereiche';
const NAV_KEY = 'nav';
const NAV_DENSITY = 1;
const NAV_PADDING_X = 0.5;
const NO_INSET = 0;

interface KkShellNavProps {
  section: string;
}

export const KkShellNav: FC<KkShellNavProps> = ({ section }) => {
  const { destinations, keyboardInset } = useKkShell();
  const reducedMotion = useReducedMotion();
  const glide = navGlide(reducedMotion);
  const sunken = keyboardInset > NO_INSET;

  const items = destinations.map((destination) => (
    <KkShellNavItem
      key={destination.id}
      destination={destination}
      active={destination.id === section}
    />
  ));

  const bar = sunken ? null : (
    <motion.div
      key={NAV_KEY}
      initial={NAV_SUNKEN}
      animate={NAV_AT_REST}
      exit={NAV_SUNKEN}
      transition={glide}
    >
      <KkChrome density={NAV_DENSITY} sx={{ height: `${navHeight}px`, px: NAV_PADDING_X }}>
        <Stack
          component="nav"
          aria-label={NAV_LABEL}
          direction="row"
          sx={{ flex: 1, alignItems: 'stretch', minWidth: 0 }}
        >
          {items}
        </Stack>
      </KkChrome>
    </motion.div>
  );

  return <AnimatePresence initial={false}>{bar}</AnimatePresence>;
};
