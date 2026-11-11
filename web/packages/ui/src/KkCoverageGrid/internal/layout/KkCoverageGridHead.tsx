import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { coverageGridLine } from '../coverage-grid-paint';

export const KkCoverageGridHead: FC<PropsWithChildren> = ({ children }) => (
  <Box
    role="row"
    sx={{
      ...coverageGridLine,
      py: 0.75,
      borderBottomWidth: kkTokens.line.section,
      borderBottomStyle: 'solid',
      borderBottomColor: 'text.primary',
    }}
  >
    {children}
  </Box>
);
