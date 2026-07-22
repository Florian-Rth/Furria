import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { chipNavFadeWidths, chipNavMaskImage, chipNavTransition } from './chip-nav-mask';
import { useChipFadeProperties } from './use-chip-fade-properties';
import { useOverflowEdges } from './use-overflow-edges';

export const ChipNavScroller: FC<PropsWithChildren> = ({ children }) => {
  const { ref, edges, onScroll } = useOverflowEdges();
  useChipFadeProperties();

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        ref={ref}
        onScroll={onScroll}
        direction="row"
        sx={(theme) => {
          const fade = chipNavFadeWidths(edges, theme.spacing(5));
          return {
            gap: 1,
            px: 2,
            pt: 0.5,
            pb: 1.5,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            '& > *': { flexShrink: 0 },
            '--chip-fade-start': fade.start,
            '--chip-fade-end': fade.end,
            maskImage: chipNavMaskImage,
            WebkitMaskImage: chipNavMaskImage,
            transition: chipNavTransition(edges, theme.transitions.easing.easeInOut, {
              enter: theme.transitions.duration.shorter,
              leave: theme.transitions.duration.complex,
            }),
          };
        }}
      >
        {children}
      </Stack>
    </Box>
  );
};
