import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { hairRule, TILE_ROW_COLUMNS } from '../tile-paint';

const rowsPaint = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: TILE_ROW_COLUMNS,
  columnGap: 1,
  m: 0,
  p: 0,
  listStyle: 'none',
  minWidth: 0,
  '& > li': {
    borderTopWidth: kkTokens.line.hair,
    borderTopStyle: 'solid',
    ...hairRule(theme),
  },
});

export const KkStartTileRows: FC<PropsWithChildren> = ({ children }) => (
  <Box component="ul" data-kk-start-tile-rows sx={rowsPaint}>
    {children}
  </Box>
);
