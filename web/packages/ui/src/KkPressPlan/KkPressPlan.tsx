import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkRegisterMarkState } from '../KkRegisterMark';
import type { KkSx } from '../kk-sx';
import { KkPressPlanSegment } from './KkPressPlanSegment';

export interface KkPressPlanTickData {
  id: string;
  state: KkRegisterMarkState;
  position: number;
  label: string;
}

export interface KkPressPlanSegmentData {
  key: string;
  label: string;
  meta: string;
  isPresent: boolean;
  ticks: readonly KkPressPlanTickData[];
}

interface KkPressPlanProps {
  label: string;
  segments: readonly KkPressPlanSegmentData[];
  onReveal: (id: string) => void;
  sx?: KkSx;
}

const scrollToPresent = (node: HTMLElement | null): void => {
  if (node !== null) {
    node.scrollLeft = node.scrollWidth;
  }
};

export const KkPressPlan: FC<KkPressPlanProps> = ({ label, segments, onReveal, sx }) => {
  const parts = segments.map((segment, order) => (
    <KkPressPlanSegment key={segment.key} segment={segment} order={order} onReveal={onReveal} />
  ));

  return (
    <Box
      component="nav"
      aria-label={label}
      data-kk-press-plan
      ref={scrollToPresent}
      sx={[
        {
          minWidth: 0,
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack direction="row" sx={{ minWidth: '100%', width: 'max-content' }}>
        {parts}
      </Stack>
    </Box>
  );
};
