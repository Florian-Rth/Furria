import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { TWIN_TIGHT } from '../twin-query';

export type KkTwinCellArea = 'eyebrow' | 'cue' | 'name' | 'count' | 'note' | 'rail' | 'keys';

const alignments: Record<KkTwinCellArea, string> = {
  eyebrow: 'center start',
  cue: 'center end',
  name: 'center stretch',
  count: 'center end',
  note: 'stretch',
  rail: 'center stretch',
  keys: 'center',
};

const NONE: CSSObject = {};

const tightOf = (area: KkTwinCellArea): CSSObject =>
  area === 'rail' ? { [TWIN_TIGHT]: { display: 'none' } } : NONE;

interface KkTwinCellProps extends PropsWithChildren {
  area: KkTwinCellArea;
}

export const KkTwinCell: FC<KkTwinCellProps> = ({ area, children }) => (
  <Box
    data-kk-twin-cell={area}
    sx={{
      gridArea: area,
      display: 'grid',
      placeItems: alignments[area],
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      ...tightOf(area),
    }}
  >
    {children}
  </Box>
);
