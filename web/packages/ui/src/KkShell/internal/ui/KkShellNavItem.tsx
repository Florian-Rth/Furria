import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import type { KkShellDestination } from '../../shell-destination';
import { navGlide, navPop } from '../logic/nav-motion';
import { useKkShell } from '../logic/shell-context';
import { KkShellNavBar } from './KkShellNavBar';
import { KkShellNavGlyph } from './KkShellNavGlyph';
import { KkShellNavLabel } from './KkShellNavLabel';
import { KkShellNavWash } from './KkShellNavWash';

const { nav } = kkTokens.shell;
const CONTENT_ATTRIBUTE = 'data-kk-shell-nav-content';
const GLYPH_GAP = 0.25;

const itemPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
  borderRadius: `${kkTokens.radius.base}px`,
  [`&:active [${CONTENT_ATTRIBUTE}]`]: { transform: `scale(${nav.pressScale})` },
  ...focusRing(theme),
});

const CONTENT_PAINT: CSSObject = {
  alignItems: 'center',
  gap: GLYPH_GAP,
  minWidth: 0,
  paddingBottom: `${nav.contentRise}px`,
  transition: kkTokens.motion.press,
};

interface KkShellNavItemProps {
  destination: KkShellDestination;
  active: boolean;
}

export const KkShellNavItem: FC<KkShellNavItemProps> = ({ destination, active }) => {
  const { link } = useKkShell();
  const reducedMotion = useReducedMotion();
  const glide = navGlide(reducedMotion);
  const pop = navPop(reducedMotion);
  const routeProps = { to: destination.to };
  const iconName = active ? destination.activeIcon : destination.icon;
  const marker = active ? (
    <>
      <KkShellNavWash transition={glide} />
      <KkShellNavBar transition={glide} />
    </>
  ) : null;

  return (
    <Stack
      component={link}
      {...routeProps}
      aria-current={active ? 'page' : undefined}
      data-kk-shell-nav-item
      sx={itemPaint}
    >
      {marker}
      <Stack data-kk-shell-nav-content sx={CONTENT_PAINT}>
        <KkShellNavGlyph name={iconName} active={active} transition={pop} />
        <KkShellNavLabel active={active}>{destination.label}</KkShellNavLabel>
      </Stack>
    </Stack>
  );
};
