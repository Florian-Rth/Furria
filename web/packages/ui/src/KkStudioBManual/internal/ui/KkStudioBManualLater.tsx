import Box from '@mui/material/Box';
import type { FC } from 'react';

const LATER = {
  listStyle: 'none',
  px: 1,
  pt: 2,
  typography: 'caption',
  color: 'text.disabled',
} as const;

interface KkStudioBManualLaterProps {
  text: string;
}

export const KkStudioBManualLater: FC<KkStudioBManualLaterProps> = ({ text }) => (
  <Box component="li" data-kk-studio-b-later sx={LATER}>
    {text}
  </Box>
);
