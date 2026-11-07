import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkCompassRootProps extends PropsWithChildren {
  label: string;
}

export const KkCompassRoot: FC<KkCompassRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-compass
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${kkTokens.tapTarget})`,
      gridTemplateRows: `repeat(3, ${kkTokens.tapTarget})`,
      gridTemplateAreas: '"a315 a0 a45" "a270 free a90" "a225 a180 a135"',
      gap: 0.5,
      justifyContent: 'start',
    }}
  >
    {children}
  </Box>
);
