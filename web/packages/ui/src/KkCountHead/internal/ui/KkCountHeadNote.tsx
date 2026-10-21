import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';

const NOTE: CSSObject = {
  display: 'inline',
  typography: 'caption',
  fontWeight: 700,
  lineHeight: 'inherit',
  color: 'text.secondary',
};

interface KkCountHeadNoteProps {
  children: string;
}

export const KkCountHeadNote: FC<KkCountHeadNoteProps> = ({ children }) => (
  <Box component="li" sx={NOTE}>
    {children}
  </Box>
);
