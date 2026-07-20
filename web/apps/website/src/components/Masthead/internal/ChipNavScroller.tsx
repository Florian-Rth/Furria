import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { OverflowEdges } from './use-overflow-edges';
import { useOverflowEdges } from './use-overflow-edges';

const fadeMask = ({ start, end }: OverflowEdges, fadeWidth: string): string =>
  `linear-gradient(to right, ${start ? 'transparent' : 'black'}, black ${fadeWidth}, black calc(100% - ${fadeWidth}), ${end ? 'transparent' : 'black'})`;

export const ChipNavScroller: FC<PropsWithChildren> = ({ children }) => {
  const { ref, edges, onScroll } = useOverflowEdges();

  return (
    <Stack
      ref={ref}
      onScroll={onScroll}
      direction="row"
      sx={(theme) => ({
        gap: 1,
        px: 2,
        pt: 0.5,
        pb: 1.5,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        maskImage: fadeMask(edges, theme.spacing(5)),
        WebkitMaskImage: fadeMask(edges, theme.spacing(5)),
        '& > *': { flexShrink: 0 },
      })}
    >
      {children}
    </Stack>
  );
};
