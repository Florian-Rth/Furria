import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { EJ_SLIM_LANES } from '../../../KkEjLaneFocus';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

export type KkEjDeskFit = 'timeline' | 'balanced' | 'stage';

const LANES_ROW: Record<KkEjDeskFit, string> = {
  timeline: '52cqh',
  balanced: '36cqh',
  stage: EJ_SLIM_LANES,
};
const PANE_COLUMN = 'clamp(19rem, 31cqw, 26rem)';

interface KkEjDeskRootProps extends PropsWithChildren {
  label: string;
  fit: KkEjDeskFit;
}

export const KkEjDeskRoot: FC<KkEjDeskRootProps> = ({ label, fit, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-ej-desk={fit}
    sx={{
      width: '100%',
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      containerType: 'size',
      containerName: 'kk-lane-desk',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}
  >
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"band band" "bar bar" "stage pane" "overview pane" "lanes pane"',
        gridTemplateColumns: `minmax(0, 1fr) ${PANE_COLUMN}`,
        gridTemplateRows: `auto auto minmax(0, 1fr) auto ${LANES_ROW[fit]}`,
        gap: 1,
        transition: 'grid-template-rows 260ms cubic-bezier(0.2, 0, 0, 1)',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {children}
    </Box>
  </Box>
);
