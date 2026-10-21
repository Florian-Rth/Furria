import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { PANE_MARK } from '../../../internal/print-in/pane-mark';
import { PANE_SCHEME, paneLayersOf } from '../../../internal/print-in/pane-paint';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { printStampOf } from '../../../internal/print-in/print-stamp';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { TileLandingContext } from '../logic/tile-context';
import { tileLandDelayMs } from '../logic/tile-land';
import {
  controlFocus,
  TILE_CONTROL,
  TILE_GAP,
  TILE_INSET,
  TILE_RADIUS,
  TILE_REACH,
  tileAttentionEdge,
  tileHoverEdge,
} from '../tile-paint';

const { light, dark } = kkTokens.color;

const framePaint =
  (order: number, settled: boolean) =>
  (theme: Theme): CSSObject => ({
    ...paneLayersOf(settled),
    height: '100%',
    minWidth: 0,
    gap: TILE_GAP,
    p: TILE_INSET,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: TILE_RADIUS,
    ...applyScheme(theme, PANE_SCHEME, schemeEdge(light.line2, dark.line2)),
    ...printStampOf(tileLandDelayMs(order), settled),
    transition: 'border-color 160ms ease-out',
    [`& ${TILE_CONTROL}`]: { position: 'relative', zIndex: 1 },
    [`& ${TILE_CONTROL}, & ${TILE_REACH}`]: controlFocus(theme),
    '@media (hover: hover)': {
      [`&:has(${TILE_REACH}:hover)`]: tileHoverEdge(theme),
    },
  });

interface KkStartTileRootProps extends PropsWithChildren {
  label: string;
  order: number;
  attention?: boolean;
  sx?: KkSx;
}

export const KkStartTileRoot: FC<KkStartTileRootProps> = ({
  label,
  order,
  attention = false,
  sx,
  children,
}) => {
  const { settled } = usePrintRun();
  const pane = { [PANE_MARK]: true };

  return (
    <TileLandingContext.Provider value={{ order }}>
      <Stack
        component="section"
        aria-label={label}
        data-kk-start-tile
        {...pane}
        sx={[
          framePaint(order, settled),
          attention && tileAttentionEdge,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Stack>
    </TileLandingContext.Provider>
  );
};
