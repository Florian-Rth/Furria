import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const GRIP_WIDTH = 48;
const GRIP_HEIGHT = 5;
const GRIP_OPACITY = 0.35;
const HANDLE_HEIGHT = 28;

interface KkSheetHandleProps {
  label: string;
  onSelect: () => void;
}

export const KkSheetHandle: FC<KkSheetHandleProps> = ({ label, onSelect }) => (
  <Stack
    component="button"
    type="button"
    aria-label={label}
    onClick={onSelect}
    data-kk-sheet-handle
    sx={{
      flexShrink: 0,
      height: HANDLE_HEIGHT,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
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
