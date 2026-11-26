import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClaimWindowSystemSection } from '@/features/claim-window/components/ClaimWindowSystemSection';
import { TestPushSection } from '@/features/push/components/TestPushSection';
import { WhatsAppSystemSection } from '@/features/whatsapp/components/WhatsAppSystemSection';
import type { SystemStatus } from '../schemas';
import { SYSTEM_HELP_SPOTS } from '../system-help-copy';
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
    <ClaimWindowSystemSection />
    <WhatsAppSystemSection />
    <SystemProgramSection status={status} moment={moment} />
    <TestPushSection landing={SYSTEM_HELP_SPOTS.testPush} />
  </Stack>
);
