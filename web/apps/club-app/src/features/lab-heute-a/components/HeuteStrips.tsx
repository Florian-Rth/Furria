import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NEXT_LABEL, NOW_SHORT, STRIP_TITLE } from '../heute-a-copy';
import type { HeuteA } from '../hooks/use-heute-a';
import { HeuteStripLine } from './HeuteStripLine';

interface HeuteStripsProps {
  heute: HeuteA;
}

export const HeuteStrips: FC<HeuteStripsProps> = ({ heute }) => (
  <Stack component="section" aria-label={STRIP_TITLE} sx={{ gap: 0.75, minWidth: 0 }}>
    <HeuteStripLine title={NOW_SHORT} chips={heute.nowChips} />
    <HeuteStripLine title={NEXT_LABEL} chips={heute.nextChips} />
  </Stack>
);
