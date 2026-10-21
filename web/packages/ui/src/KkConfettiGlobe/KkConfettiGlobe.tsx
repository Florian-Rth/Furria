import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { PANE_SELECTOR } from '../internal/print-in/pane-mark';
import { useKkColorScheme } from '../use-kk-color-scheme';
import type { KkGlobeFeed } from './globe-feed';
import { useGlobeCanvas } from './internal/use-globe-canvas';

interface KkConfettiGlobeProps {
  feed: KkGlobeFeed;
  still?: boolean;
}

const NO_INSET = 0;
const SHELL_CHROME = { ceiling: '[data-kk-shell-chrome]', floor: '[data-kk-shell-foot]' } as const;

const aboveBars = (theme: Theme): number => theme.zIndex.appBar + 1;

export const KkConfettiGlobe: FC<KkConfettiGlobeProps> = ({ feed, still = false }) => {
  const scheme = useKkColorScheme();
  const attachCanvas = useGlobeCanvas(feed, still, NO_INSET, scheme, PANE_SELECTOR, SHELL_CHROME);

  return (
    <Portal>
      <Box
        ref={attachCanvas}
        component="canvas"
        aria-hidden
        data-kk-confetti-globe=""
        sx={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: aboveBars,
        }}
      />
    </Portal>
  );
};
