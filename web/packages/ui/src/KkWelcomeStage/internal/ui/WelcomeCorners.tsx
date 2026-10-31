import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { KkRegisterMark } from '../../../KkRegisterMark';
import { fadeIn, REDUCED_MOTION } from '../welcome-paint';

const MARK_SIZE = 14;
const EDGE_GAP = 5;
const FADE_MS = 600;

const CORNERS: readonly { key: string; place: CSSObject }[] = [
  { key: 'top-left', place: { top: safeArea('top', EDGE_GAP), left: EDGE_GAP } },
  { key: 'top-right', place: { top: safeArea('top', EDGE_GAP), right: EDGE_GAP } },
  { key: 'bottom-left', place: { bottom: safeArea('bottom', EDGE_GAP), left: EDGE_GAP } },
  { key: 'bottom-right', place: { bottom: safeArea('bottom', EDGE_GAP), right: EDGE_GAP } },
];

export const WelcomeCorners: FC = () => {
  const marks = CORNERS.map((corner) => (
    <Stack
      key={corner.key}
      sx={{
        position: 'absolute',
        ...corner.place,
        animation: `${fadeIn} ${FADE_MS}ms ease both`,
        [REDUCED_MOTION]: { animation: 'none' },
      }}
    >
      <KkRegisterMark state="aligned" size={MARK_SIZE} />
    </Stack>
  ));

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
