import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { PrintRunContext } from '../../../internal/print-in/print-run';
import { backdropPaintOf } from '../backdrop-paint';
import type { KkPosterPhase } from '../logic/poster-composition';
import { posterTintOf } from '../logic/poster-composition';
import { usePageHidden } from '../logic/use-page-hidden';
import { usePrintSettle } from '../logic/use-print-settle';
import type { PlateLanding } from '../plate-paint';
import { PosterArt } from '../ui/PosterArt';

interface KkPosterBackdropRootProps extends PropsWithChildren {
  phase: KkPosterPhase;
  runUp: number;
  evening: boolean;
  foil: boolean;
  held?: boolean;
}

const landingOf = (held: boolean, settled: boolean): PlateLanding => {
  if (settled) {
    return 'landed';
  }

  return held ? 'held' : 'landing';
};

export const KkPosterBackdropRoot: FC<KkPosterBackdropRootProps> = ({
  phase,
  runUp,
  evening,
  foil,
  held = false,
  children,
}) => {
  const settled = usePrintSettle();
  const hidden = usePageHidden();
  const run = { settled, hidden };

  return (
    <PrintRunContext.Provider value={run}>
      <Stack sx={backdropPaintOf(posterTintOf(phase, foil))}>
        <PosterArt
          phase={phase}
          runUp={runUp}
          evening={evening}
          landing={landingOf(held, settled)}
        />
        {children}
      </Stack>
    </PrintRunContext.Provider>
  );
};
