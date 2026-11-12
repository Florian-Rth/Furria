import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface KkCoverageGridRowHeadProps {
  name: string;
  lead?: ReactNode;
}

export const KkCoverageGridRowHead: FC<KkCoverageGridRowHeadProps> = ({ name, lead }) => (
  <Stack role="rowheader" direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
    {lead}
    <Box
      component="span"
      sx={{
        typography: 'body2',
        fontWeight: 700,
        lineHeight: 1.25,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </Box>
  </Stack>
);
