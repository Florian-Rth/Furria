import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { boardCell, boardFrame } from './internal/board-paint';

const ROWS = ['database', 'media', 'storage', 'services', 'mail', 'log'] as const;
const VERDICT_WIDTH = '62%';
const VERDICT_HEIGHT = '2rem';

interface KkFlapBoardSkeletonProps {
  label: string;
  sx?: KkSx;
}

export const KkFlapBoardSkeleton: FC<KkFlapBoardSkeletonProps> = ({ label, sx }) => {
  const rows = ROWS.map((row) => (
    <Box
      key={row}
      sx={{ ...boardCell, minHeight: kkTokens.system.boardRow, animation: kkTokens.motion.breath }}
    />
  ));

  return (
    <Stack
      role="status"
      aria-label={label}
      aria-busy
      data-kk-flap-board-skeleton
      sx={[boardFrame, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack sx={{ rowGap: kkTokens.system.boardGap }}>{rows}</Stack>
      <Box
        sx={{
          ...boardCell,
          width: VERDICT_WIDTH,
          height: VERDICT_HEIGHT,
          animation: kkTokens.motion.breath,
        }}
      />
    </Stack>
  );
};
