import Box from '@mui/material/Box';
import type { FC } from 'react';

interface KkStudioIStageCatchProps {
  onPress: () => void;
}

export const KkStudioIStageCatch: FC<KkStudioIStageCatchProps> = ({ onPress }) => (
  <Box
    aria-hidden
    onClick={onPress}
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
  />
);
