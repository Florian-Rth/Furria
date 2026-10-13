import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, SYSTEM_ORIGIN } from '@/features/session';
import { SECTION_TITLES } from '../system-copy';
import type { SystemArea } from '../types';
import { SystemAreaBody } from './SystemAreaBody';
import { SystemAreaHeader } from './SystemAreaHeader';

interface SystemAreaPageProps {
  area: SystemArea;
}

export const SystemAreaPage: FC<SystemAreaPageProps> = ({ area }) => (
  <KkScreen
    kind="working"
    title={SECTION_TITLES[area]}
    origin={SYSTEM_ORIGIN}
    header={<SystemAreaHeader area={area} />}
    handover={AREA_HANDOVERS.system}
  >
    <SystemAreaBody area={area} />
  </KkScreen>
);
