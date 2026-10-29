import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { useScrollDriven } from '../../../internal/use-scroll-driven';
import type { KkHandoverHeaderProps } from '../../handover-stage';
import { KkShellHeader } from '../../internal/layout/KkShellHeader';
import { ConfettiHeaderFollowFade } from './ConfettiHeaderFollowFade';
import { ConfettiHeaderScrollFade } from './ConfettiHeaderScrollFade';
import { ConfettiDockContext, useConfettiDockLink } from './confetti-dock-context';
import { DOCK_HEADLINE_VISIBILITY } from './dock-headline-visibility';

const HEADER_GAP = 1.25;

export const ConfettiHeader: FC<KkHandoverHeaderProps> = ({ kind, children }) => {
  const reducedMotion = useReducedMotion();
  const scrollDriven = useScrollDriven();
  const dock = useConfettiDockLink();
  const Fade = scrollDriven ? ConfettiHeaderScrollFade : ConfettiHeaderFollowFade;

  if (kind === 'banner' || reducedMotion) {
    return <KkShellHeader kind={kind}>{children}</KkShellHeader>;
  }

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <ConfettiDockContext.Provider value={dock}>
      <Fade>
        <Stack
          sx={{
            minWidth: 0,
            gap: HEADER_GAP,
            pointerEvents: 'none',
            '& [data-kk-screen-header-title]': { opacity: `var(${DOCK_HEADLINE_VISIBILITY})` },
          }}
        >
          {children}
        </Stack>
      </Fade>
    </ConfettiDockContext.Provider>
  );
};
