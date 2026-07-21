import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { EdgeFade } from './EdgeFade';
import { useOverflowEdges } from './use-overflow-edges';

export const ChipNavScroller: FC<PropsWithChildren> = ({ children }) => {
  const { ref, edges, onScroll } = useOverflowEdges();

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        ref={ref}
        onScroll={onScroll}
        direction="row"
        sx={{
          gap: 1,
          px: 2,
          pt: 0.5,
          pb: 1.5,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '& > *': { flexShrink: 0 },
        }}
      >
        {children}
      </Stack>
      <EdgeFade side="left" visible={edges.start} />
      <EdgeFade side="right" visible={edges.end} />
    </Box>
  );
};
