import Box from '@mui/material/Box';
import type { FC } from 'react';

interface KkNewsProofBarProps {
  width: string;
  strong?: boolean;
}

export const KkNewsProofBar: FC<KkNewsProofBarProps> = ({ width, strong = false }) => (
  <Box
    aria-hidden
    sx={{
      width,
      height: strong ? 5 : 3,
      borderRadius: 1,
      bgcolor: strong ? 'text.primary' : 'text.disabled',
      flexShrink: 0,
    }}
  />
);
