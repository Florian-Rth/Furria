import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { COVERAGE_GRID_COLUMNS, coverageGridColumnsOf } from '../coverage-grid-paint';

interface KkCoverageGridRootProps extends PropsWithChildren {
  label: string;
  markColumnCount: number;
  sx?: KkSx;
}

export const KkCoverageGridRoot: FC<KkCoverageGridRootProps> = ({
  label,
  markColumnCount,
  sx,
  children,
}) => (
  <Box sx={[{ minWidth: 0, overflowX: 'auto' }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <Stack
      role="table"
      aria-label={label}
      data-kk-coverage-grid
      sx={{
        minWidth: 'min-content',
        [COVERAGE_GRID_COLUMNS]: coverageGridColumnsOf(markColumnCount),
      }}
    >
      {children}
    </Stack>
  </Box>
);
