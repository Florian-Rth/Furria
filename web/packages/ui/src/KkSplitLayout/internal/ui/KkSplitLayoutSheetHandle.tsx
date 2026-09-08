import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PointerEvent as ReactPointerEvent } from 'react';
import { kkTokens } from '../../../tokens';
import { SHEET_PEEK_HEIGHT } from '../logic/sheet-metrics';

const HANDLE_LABEL = 'Anmeldebereich auf- oder zuziehen';
const GRIP_WIDTH = 48;
const GRIP_HEIGHT = 5;
const GRIP_OPACITY = 0.35;

interface KkSplitLayoutSheetHandleProps {
  isOpen: boolean;
  onToggle: () => void;
  onDragStart: (event: ReactPointerEvent<Element>) => void;
}

export const KkSplitLayoutSheetHandle: FC<KkSplitLayoutSheetHandleProps> = ({
  isOpen,
  onToggle,
  onDragStart,
}) => (
  <Stack
    component="button"
    type="button"
    aria-expanded={isOpen}
    aria-label={HANDLE_LABEL}
    onClick={onToggle}
    onPointerDown={onDragStart}
    data-kk-split-layout-sheet-handle
    sx={{
      flexShrink: 0,
      height: SHEET_PEEK_HEIGHT,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
      border: 'none',
      background: 'none',
      cursor: 'grab',
      touchAction: 'none',
      '&:active': { cursor: 'grabbing' },
    }}
  >
    <Box
      aria-hidden
      sx={{
        width: GRIP_WIDTH,
        height: GRIP_HEIGHT,
        borderRadius: `${kkTokens.radius.pill}px`,
        bgcolor: 'text.primary',
        opacity: GRIP_OPACITY,
      }}
    />
  </Stack>
);
