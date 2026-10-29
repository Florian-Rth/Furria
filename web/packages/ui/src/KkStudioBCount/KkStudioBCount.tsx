import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkStudioBCountBeats } from './internal/KkStudioBCountBeats';
import { KkStudioBCountDigit } from './internal/KkStudioBCountDigit';
import { KkStudioBCountEights } from './internal/KkStudioBCountEights';

const ROW = {
  display: 'grid',
  gridTemplateColumns: '2.5rem minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 1.25,
  minWidth: 0,
} as const;

const EIGHT_LABEL = {
  typography: 'caption',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  lineHeight: 1,
} as const;

interface KkStudioBCountProps {
  count: number | null;
  eight: number | null;
  eights: number;
  share: number;
  label: string;
  eightLabel: string;
  sx?: KkSx;
}

export const KkStudioBCount: FC<KkStudioBCountProps> = ({
  count,
  eight,
  eights,
  share,
  label,
  eightLabel,
  sx,
}) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-b-count
    sx={[ROW, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkStudioBCountDigit count={count} />
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkStudioBCountBeats count={count} />
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
        <KkStudioBCountEights eight={eight} eights={eights} share={share} />
        <Box component="span" sx={EIGHT_LABEL}>
          {eightLabel}
        </Box>
      </Stack>
    </Stack>
  </Box>
);
