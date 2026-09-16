import Stack from '@mui/material/Stack';
import { MotionConfig } from 'motion/react';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { chromeDensityAt } from '../internal/chrome-density';
import { useReducedMotion } from '../internal/use-reduced-motion';
import type { KkSx } from '../kk-sx';
import { handoverAt } from './internal/logic/handover';
import { KkShellContext } from './internal/logic/shell-context';
import { useKeyboardInset } from './internal/logic/use-keyboard-inset';
import { useTrackScroll } from './internal/logic/use-track-scroll';
import { KkShellSkipLink } from './internal/ui/KkShellSkipLink';
import type { KkScreenMove } from './screen-move';
import type { KkShellDestination } from './shell-destination';

interface KkShellProps extends PropsWithChildren {
  link: ElementType;
  destinations: readonly KkShellDestination[];
  path: string;
  move: KkScreenMove;
  sx?: KkSx;
}

export const KkShell: FC<KkShellProps> = ({ link, destinations, path, move, sx, children }) => {
  const scrollOffset = useTrackScroll();
  const keyboardInset = useKeyboardInset();
  const reducedMotion = useReducedMotion();
  const motion = reducedMotion ? 'instant' : 'ramped';
  const density = chromeDensityAt(scrollOffset, motion);
  const handover = handoverAt(scrollOffset, motion);

  return (
    <KkShellContext.Provider
      value={{ density, handover, link, destinations, keyboardInset, path, move }}
    >
      <MotionConfig reducedMotion="user">
        <Stack
          data-kk-shell
          sx={[
            { minHeight: '100dvh', minWidth: 0, bgcolor: 'background.default' },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <KkShellSkipLink />
          {children}
        </Stack>
      </MotionConfig>
    </KkShellContext.Provider>
  );
};
