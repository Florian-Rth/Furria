import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { edgeFadeMaskImage, edgeFadeTransition, edgeFadeWidths } from './internal/edge-fade-mask';
import { useEdgeFadeProperties } from './internal/use-edge-fade-properties';
import { useOverflowEdges } from './internal/use-overflow-edges';
import type { KkSx } from './kk-sx';

interface KkChipScrollerProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkChipScroller: FC<KkChipScrollerProps> = ({ children, sx }) => {
  const { ref, edges, onScroll } = useOverflowEdges();
  useEdgeFadeProperties();

  return (
    <Stack
      ref={ref}
      onScroll={onScroll}
      direction="row"
      data-kk-chip-scroller
      sx={[
        (theme) => {
          const fade = edgeFadeWidths(edges, theme.spacing(5));
          return {
            minWidth: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            '& > *': { flexShrink: 0 },
            '--kk-edge-fade-start': fade.start,
            '--kk-edge-fade-end': fade.end,
            maskImage: edgeFadeMaskImage,
            WebkitMaskImage: edgeFadeMaskImage,
            transition: edgeFadeTransition(edges, theme.transitions.easing.easeInOut, {
              enter: theme.transitions.duration.shorter,
              leave: theme.transitions.duration.complex,
            }),
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
};
