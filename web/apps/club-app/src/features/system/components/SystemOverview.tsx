import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import type { SystemMoment } from '../system-view';
import { SystemAreaList } from './SystemAreaList';
import { SystemBoard } from './SystemBoard';
import { SystemProgramSection } from './SystemProgramSection';

const OVERVIEW_GAP = 3;

interface SystemOverviewProps {
  status: SystemStatus;
  moment: SystemMoment;
  offline: string | null;
}

export const SystemOverview: FC<SystemOverviewProps> = ({ status, moment, offline }) => (
  <Stack sx={{ gap: OVERVIEW_GAP, minWidth: 0 }}>
    <SystemBoard status={status} moment={moment} offline={offline} />
    <SystemAreaList status={status} moment={moment} />
    <SystemProgramSection status={status} moment={moment} />
  </Stack>
);
