import { KkFlapBoardSkeleton } from '@furria/ui/KkFlapBoardSkeleton';
import { KkReadoutSkeleton } from '@furria/ui/KkReadoutSkeleton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AREAS_TITLE, SECTION_TITLES, STATUS_LOADING_LABEL } from '../system-copy';

const OVERVIEW_GAP = 3;
const AREA_LINES = 6;

export const SystemSkeleton: FC = () => (
  <Stack sx={{ gap: OVERVIEW_GAP, minWidth: 0 }}>
    <KkFlapBoardSkeleton label={STATUS_LOADING_LABEL} />
    <KkReadoutSkeleton title={AREAS_TITLE} lines={AREA_LINES} />
    <KkReadoutSkeleton title={SECTION_TITLES.program} lines={1} />
  </Stack>
);
