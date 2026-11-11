import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { rowDividerTop } from '../../../internal/row-divider';
import { coverageGridLine } from '../coverage-grid-paint';

export const KkCoverageGridRow: FC<PropsWithChildren> = ({ children }) => (
  <Box
    role="row"
    data-kk-coverage-grid-row
    sx={{ ...coverageGridLine, py: 0.25, ...rowDividerTop }}
  >
    {children}
  </Box>
);
