import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { PANE_MARK } from '../../../internal/print-in/pane-mark';
import { PANE_SCHEME, paneLayersOf } from '../../../internal/print-in/pane-paint';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { TILE_RADIUS } from '../../../KkStartTile/internal/tile-paint';
import { kkTokens } from '../../../tokens';

const { light, dark } = kkTokens.color;

const headPaintOf =
  (settled: boolean) =>
  (theme: Theme): CSSObject => ({
    ...paneLayersOf(settled),
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    gap: 1.5,
    px: 1.5,
    py: 0.75,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: TILE_RADIUS,
    ...applyScheme(theme, PANE_SCHEME, schemeEdge(light.line2, dark.line2)),
    [theme.breakpoints.up('md')]: { px: 2, py: 1.5 },
  });

export const KkCountHeadRoot: FC<PropsWithChildren> = ({ children }) => {
  const { settled } = usePrintRun();
  const pane = { [PANE_MARK]: true };

  return (
    <Stack direction="row" data-kk-count-head {...pane} sx={headPaintOf(settled)}>
      {children}
    </Stack>
  );
};
